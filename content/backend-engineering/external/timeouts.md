---
kind: concept
contentKey: backend.core.external.timeouts
topicContentKey: backend.core.external
slug: timeouts
title: "외부 호출 Timeout과 Deadline"
summary: "외부 호출의 연결·요청·응답 대기 시간을 bounded하게 만들고, client별 timeout 의미와 상위 요청의 전체 deadline, 재시도와 자원 점유를 함께 판단한다."
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
    relationNote: "request timeout 설정 계약 확인"
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc-client.html"
    title: "Spring Framework Reference: REST Clients"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "Spring REST client abstraction의 선택 경계 확인"
---
# 외부 호출 Timeout과 Deadline

외부 API를 호출할 때 timeout이 없으면 상대 시스템이 느려진 순간 우리 애플리케이션의 thread와 connection 같은 자원도 끝없이 기다릴 수 있습니다. 하지만 "timeout을 3초로 설정했다"는 정보만으로는 충분하지 않습니다. **어느 구간의 시간을 제한하는지와 전체 사용자 요청이 언제까지 끝나야 하는지**를 함께 봐야 합니다.

### Timeout 이름은 client마다 같은 의미가 아니다

HTTP 호출에는 여러 단계가 있습니다.

```text
endpoint resolution
      ↓
connection establishment
      ↓
request 전송
      ↓
remote 처리
      ↓
response 수신
```

`connect timeout`, `read timeout`, `response timeout`, `request timeout` 같은 이름은 라이브러리마다 정확한 측정 범위가 다를 수 있습니다. Java `HttpClient`도 client 수준의 connect timeout과 `HttpRequest`의 timeout을 별도로 제공합니다.

따라서 이름만 보고 DNS, TLS handshake, body read가 어느 timeout에 포함되는지 일반화하지 말고 **사용하는 client의 실제 계약을 확인**해야 합니다.

### 요청을 보낸 뒤의 timeout은 remote 실패를 의미하지 않을 수 있다

결제 요청을 remote에 전달한 뒤 응답만 늦었다고 해 보겠습니다.

```text
client ── request ──▶ payment service
                         │
                         └─ 결제 승인/commit

client ◀──── 응답 지연 또는 유실
   │
   └─ timeout
```

클라이언트는 timeout을 보지만 결제사는 이미 성공했을 수 있습니다. 따라서 요청 전송 이후 timeout을 "상대가 아무 일도 하지 않았다"는 증거로 사용하면 안 됩니다.

주문·결제처럼 중복 효과가 위험한 작업은 retry 여부를 결정할 때 idempotency key, operation status 조회, reconciliation 가능성을 함께 봐야 합니다.

### 개별 호출 timeout과 전체 deadline을 구분한다

상위 API가 1초 안에 끝나야 하는데 하위 호출마다 800ms timeout을 세 번 사용하면 전체 요청은 쉽게 1초를 넘습니다.

```text
전체 deadline: 1000ms

DB 조회       150ms 사용
외부 호출     남은 budget 안에서 수행
retry         남은 시간이 충분할 때만
응답 생성     deadline 이전 종료
```

상위 요청의 남은 시간보다 하위 client가 더 오래 기다리면 사용자는 이미 timeout을 받았는데 서버에서는 worker가 계속 외부 응답을 기다리는 상황이 생길 수 있습니다. 그래서 여러 dependency를 거치는 시스템에서는 **remaining time budget을 아래 호출로 전달하는 설계**가 중요할 수 있습니다.

### Timeout과 retry는 함께 자원 사용량을 키울 수 있다

상대가 느린 상황에서 timeout이 발생할 때마다 즉시 재시도하면 하나의 사용자 요청이 remote 호출 여러 개로 증폭됩니다.

```text
logical request
  ├─ attempt 1 ─ timeout
  ├─ attempt 2 ─ timeout
  └─ attempt 3 ─ timeout
```

원래 느려진 dependency에 추가 부하를 보내고, 우리 쪽에서도 thread·connection을 더 오래 점유할 수 있습니다. 따라서 retry는 transient한 실패인지, 작업이 중복 안전한지, 남은 deadline이 있는지를 확인한 뒤 제한된 횟수와 backoff를 적용해야 합니다.

### 값을 크게 늘리는 것이 해결책은 아니다

Timeout이 자주 난다는 이유로 1초를 30초로 늘리면 오류 횟수는 줄어 보일 수 있습니다. 대신 요청 하나가 자원을 30배 오래 잡고 있을 수 있어 pool 고갈과 tail latency가 더 심해질 수 있습니다.

운영에서는 timeout 종류와 함께 remote latency, connection pool 사용량, retry 횟수, 상위 요청 deadline 초과를 같이 봐야 합니다.

외부 호출 timeout의 목적은 느린 호출을 무조건 성공시키는 것이 아니라 **한 호출이 사용할 시간을 bounded하게 만들고, 결과를 모르는 실패에서도 재시도와 자원 사용이 통제되도록 하는 것**입니다.
