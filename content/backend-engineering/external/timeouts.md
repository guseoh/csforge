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

외부 API 호출이 멈췄을 때 “timeout을 설정했다”고만 말하면 부족합니다. 연결을 맺는 단계에서 멈춘 것인지, 연결은 됐지만 응답을 기다리는 단계에서 멈춘 것인지에 따라 원인과 자원 점유가 다릅니다.

```text
request
  │
  ├─ DNS / connect / TLS 수립 ── connect timeout
  │
  └─ request 전송 후 response 대기 ── read/response timeout
```

Java `HttpClient`처럼 client 수준의 connect timeout과 request 수준의 response timeout을 별도로 제공하는 API가 있습니다. 사용하는 HTTP client가 어떤 단계에 어떤 timeout을 적용하는지는 해당 client 계약으로 확인해야 하며, 이름이 비슷하다고 모든 timeout이 같은 시계를 공유한다고 가정하면 안 됩니다.

### connect timeout은 연결 수립의 상한이다

서버가 죽었거나 route가 잘못되었거나 네트워크 경로가 black hole인 경우 connection establishment가 끝나지 않을 수 있습니다. 이 단계가 무한히 기다리면 caller thread뿐 아니라 connection pool의 대기 슬롯도 오래 점유될 수 있습니다.

```text
worker 1 ── connect 대기 ──┐
worker 2 ── connect 대기 ──┼─ pool capacity 감소
worker 3 ── connect 대기 ──┘
```

connect timeout이 발생했다는 사실만으로 remote application이 요청을 받았는지는 알 수 없습니다. 따라서 connect 실패와 remote가 요청을 처리한 뒤 응답이 늦은 경우를 retry와 idempotency 판단에서 구분해야 합니다.

### read/response timeout은 응답 대기의 상한이다

연결이 성공한 뒤 remote가 느리게 응답하거나 response body를 끝내 보내지 않으면 별도 응답 대기 timeout이 필요합니다. 이 timeout이 발생해 caller가 실패해도 remote가 이미 작업을 시작했을 가능성은 남습니다.

```text
client ── request 전송 ──▶ remote
client ◀─ 아직 response 없음 ── remote가 처리 중일 수도 있음
        │
        └─ response timeout -> caller 실패
```

그래서 timeout을 “remote가 실행하지 않았다”는 증거로 사용하면 안 됩니다. 결제·주문처럼 재전송이 중복 효과를 낼 수 있는 operation은 idempotency key나 결과 조회 같은 별도 계약이 필요합니다.

### 개별 timeout과 전체 deadline은 다르다

한 요청이 DNS, connect, TLS, remote processing, response parsing을 차례로 거친다면 각 단계에 timeout을 따로 둬도 전체 시간이 API SLA를 넘을 수 있습니다. 상위 request가 가진 deadline을 하위 호출에 전달하고, 남은 시간 안에서 connect/read/retry를 판단하는 구조가 전체 budget을 지킵니다.

```text
전체 deadline 800 ms
  ├─ connect에 최대 200 ms
  ├─ remote response에 남은 시간 사용
  └─ retry는 남은 budget이 충분할 때만
```

하위 client가 자체 timeout을 갖더라도 caller의 deadline보다 길게 기다리면 상위 요청은 이미 취소된 뒤에도 worker와 connection을 계속 사용할 수 있습니다.

### timeout과 retry는 자원을 함께 증폭시킨다

timeout 뒤 무조건 즉시 retry하면 하나의 사용자 요청이 remote에 여러 번 도달하고, 원래 막힌 pool에 추가 work를 밀어 넣습니다. transient failure인지, operation이 retry-safe한지, 남은 deadline이 있는지, retry 횟수와 backoff가 제한되는지를 함께 판단해야 합니다.

```text
사용자 요청
  └─ attempt 1 timeout
      └─ retry attempt 2
          └─ retry attempt 3

하나의 logical request가 remote 부하와 local wait를 키울 수 있음
```

### 운영에서는 증상과 경계를 나눠 본다

timeout이 증가했을 때 다음 지표를 함께 확인합니다.

1. connect timeout과 response timeout의 비율
2. connection pool 사용량과 대기 시간
3. remote latency의 p95/p99와 error rate
4. caller deadline 초과와 retry 횟수
5. 요청이 remote에서 실제로 처리됐을 가능성과 중복 방지 상태

timeout 값 하나를 크게 늘리는 것은 실패를 해결하기보다 pool 고갈과 tail latency를 뒤로 미루는 선택일 수 있습니다.

### 문제를 풀 때 확인할 것

1. 어느 단계에서 시간이 소진되었는지 확인합니다.
2. client timeout이 전체 request deadline을 넘지 않는지 봅니다.
3. timeout 후 remote side effect 가능성을 남겨 둡니다.
4. retry가 허용되는 operation인지와 남은 budget을 함께 판단합니다.
5. timeout을 thread/connection pool 점유와 연결해 봅니다.

### 면접에서 설명한다면

connect timeout은 연결 수립의 상한이고 read 또는 response timeout은 연결 후 응답 대기의 상한입니다. 둘을 분리해야 장애 위치와 자원 점유를 진단할 수 있으며, 개별 timeout만으로 전체 API deadline이 보장되지는 않습니다. timeout 뒤에는 remote side effect가 이미 발생했을 가능성이 있으므로 retry 횟수·deadline·idempotency를 함께 설계해야 합니다.

