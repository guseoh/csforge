---
kind: concept
contentKey: backend.core.external.timeouts
topicContentKey: backend.core.external
slug: timeouts
title: "connect/read timeout"
summary: "외부 호출에서 연결 수립과 응답 대기를 bounded하게 만들고 전체 request deadline과 pool 고갈을 함께 설계한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.Builder.html"
    title: "Java SE 25 API: HttpClient.Builder"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "HTTP client의 connect timeout 설정 계약 확인"
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html"
    title: "Java SE 25 API: HttpRequest.Builder"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "request timeout과 응답 대기 실패 계약 확인"
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc-client.html"
    title: "Spring Framework Reference: REST Clients"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "Spring REST client abstraction의 선택 경계 확인"
---
# connect/read timeout

외부 API 호출이 멈췄을 때 “timeout을 설정했다”고만 말하면 부족합니다. 연결을 맺는 단계에서 멈춘 것인지, request를 보낸 뒤 response를 기다리는 단계에서 멈춘 것인지에 따라 원인과 자원 점유, retry 안전성이 달라집니다.

```text
request lifecycle
  ├─ endpoint resolution / connection establishment
  ├─ request 전송
  └─ response 대기·수신

어느 구간을 connect/read/request timeout이 재는지는 HTTP client 계약으로 확인
```

`connect timeout`, `read timeout`, `response timeout`, `request timeout`이라는 이름은 library마다 같은 범위를 뜻하지 않습니다. 예를 들어 Java `HttpClient`는 client 수준의 connect timeout과 `HttpRequest` 수준의 request timeout을 별도로 제공하지만, 다른 client의 `read timeout`과 완전히 같은 시계라고 가정하면 안 됩니다. DNS resolution이나 TLS handshake가 어느 timeout에 포함되는지도 사용하는 client와 runtime의 계약으로 확인해야 합니다.

### connect timeout은 연결 수립 경계의 실패다

서버가 죽었거나 route가 잘못되었거나 네트워크 경로가 black hole인 경우 connection establishment가 끝나지 않을 수 있습니다. 이 단계가 무한히 기다리면 caller thread나 connection-management resource가 오래 점유될 수 있습니다.

```text
worker 1 ── connection establishment 대기 ──┐
worker 2 ── connection establishment 대기 ──┼─ available capacity 감소
worker 3 ── connection establishment 대기 ──┘
```

다만 **connect timeout의 정확한 의미는 client 계약으로 판단해야 합니다.** Java `HttpClient`의 `HttpConnectTimeoutException`처럼 요청을 보낼 connection이 성공적으로 establish되지 못한 경우를 나타내는 API에서는, 이를 request 전송 뒤 response timeout과 같은 `outcome unknown` 상태로 취급하면 안 됩니다. 반대로 connection 재사용, proxy, protocol handshake 등 실제 경로가 복잡한 client에서는 어느 단계까지 요청 bytes나 remote side effect가 진행될 수 있는지 구현 계약을 확인합니다.

### request/read/response timeout은 remote outcome과 분리한다

request가 remote에 전달된 뒤 response를 정해진 시간 안에 받지 못했다면 caller는 실패를 관찰해도 remote가 이미 작업을 시작했거나 commit했을 가능성이 남습니다.

```text
client ── request 전송 ──▶ remote ── side effect/commit 가능
client ◀─ response 지연·유실
        │
        └─ request/response timeout -> caller는 outcome을 모를 수 있음
```

따라서 **request 전송 뒤의 timeout을 “remote가 실행하지 않았다”는 증거로 사용하면 안 됩니다.** 결제·주문처럼 재전송이 중복 효과를 낼 수 있는 operation은 idempotency key, operation status 조회, reconciliation 같은 별도 계약이 필요합니다.

### 개별 timeout과 전체 deadline은 다르다

한 요청이 resolution, connection establishment, remote processing, response parsing을 차례로 거친다면 각 단계에 timeout을 따로 둬도 전체 시간이 API SLA를 넘을 수 있습니다. 상위 request가 가진 deadline을 하위 호출에 전달하고, 이미 소비한 시간을 제외한 remaining budget 안에서 다음 호출과 retry를 판단하는 구조가 전체 budget을 지킵니다.

```text
전체 deadline 800 ms
  ├─ connection establishment에 사용할 budget
  ├─ remote response에 남은 budget
  └─ retry는 remaining budget이 충분할 때만
```

하위 client가 자체 timeout을 갖더라도 caller의 deadline보다 길게 기다리면 상위 요청은 이미 취소된 뒤에도 worker와 connection을 계속 사용할 수 있습니다.

### timeout과 retry는 자원을 함께 증폭시킨다

timeout 뒤 무조건 즉시 retry하면 하나의 사용자 요청이 remote에 여러 번 도달하고, 원래 막힌 pool에 추가 work를 밀어 넣습니다. transient failure인지, operation이 retry-safe한지, request가 전송되었을 가능성이 있는지, 남은 deadline이 있는지, retry 횟수와 backoff가 제한되는지를 함께 판단해야 합니다.

```text
사용자 요청
  └─ attempt 1 timeout
      └─ retry attempt 2
          └─ retry attempt 3

하나의 logical request가 remote 부하와 local wait를 키울 수 있음
```

### 운영에서는 증상과 경계를 나눠 본다

timeout이 증가했을 때 다음 지표를 함께 확인합니다.

1. connection-establishment timeout과 request/response timeout의 비율
2. connection pool 사용량과 대기 시간
3. remote latency의 p95/p99와 error rate
4. caller deadline 초과와 retry 횟수
5. request 전송 여부와 remote side effect 가능성, 중복 방지 상태

timeout 값 하나를 크게 늘리는 것은 실패를 해결하기보다 pool 고갈과 tail latency를 뒤로 미루는 선택일 수 있습니다.

### 문제를 풀 때 확인할 것

1. 사용하는 client에서 각 timeout이 어느 구간을 재는지 확인합니다.
2. client timeout이 전체 request deadline을 넘지 않는지 봅니다.
3. request 전송 뒤 timeout이면 remote side effect 가능성을 남겨 둡니다.
4. retry가 허용되는 operation인지와 remaining budget을 함께 판단합니다.
5. timeout을 thread/connection pool 점유와 연결해 봅니다.

### 면접에서 설명한다면

connect timeout은 connection establishment의 상한이고 read/response/request timeout은 client 계약에 따라 request 전송 이후 응답을 기다리는 범위를 제한합니다. 이름만 보고 같은 시계라고 가정하지 않고 실제 API 계약을 확인해야 합니다. 특히 request가 remote에 전달된 뒤 timeout이 발생하면 side effect가 이미 일어났을 수 있으므로 deadline·retry·idempotency·결과 조회를 함께 설계합니다.

