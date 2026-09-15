---
kind: concept
contentKey: security.core.abuse.rate-limit
topicContentKey: security.core.abuse
slug: rate-limit
title: "Rate limiting과 abuse control"
summary: "로그인/API abuse에서 identity·IP·API key 같은 제한 key, window와 burst 정책, 여러 instance가 quota state를 공유할 때의 trade-off와 정상 사용자 오탐을 판단한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#login-throttling"
    title: "OWASP Authentication Cheat Sheet: Login Throttling"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: brute-force 방어를 위한 throttling/account lockout 고려 확인
  - url: "https://www.rfc-editor.org/rfc/rfc6585#section-4"
    title: "RFC 6585: 429 Too Many Requests"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: rate limit 초과 HTTP 429와 Retry-After semantics 확인
---
# Rate limiting과 abuse control

강한 password hashing이나 올바른 authorization이 있어도 공격자가 비싼 endpoint를 매우 높은 빈도로 호출할 수 있다면 brute force와 자원 고갈 위험이 남습니다. Rate limiting은 **특정 요청 주체나 signal을 기준으로 일정 시간 동안 허용할 요청량을 제한하는 abuse-control 수단**입니다.

### 무엇을 하나의 요청 주체로 볼지 먼저 정한다

제한 key에 따라 막을 수 있는 공격과 정상 사용자 영향이 달라집니다.

```text
IP 기준
  + 익명 요청에도 적용 가능
  - NAT·proxy 뒤 여러 정상 사용자가 같은 IP를 공유할 수 있음

Account/email 기준
  + 특정 계정 대상 brute force를 제한하기 쉬움
  - 공격자가 여러 계정으로 분산할 수 있음

Authenticated principal/API key 기준
  + 사용자·client별 quota에 적합
  - 인증 전 abuse에는 사용할 수 없음
```

하나의 key만으로 충분하지 않은 경우 여러 signal을 조합할 수 있지만, 공격 차단률만 높이려다 정상 사용자를 과도하게 막지 않도록 false positive를 함께 봐야 합니다.

### Window 정책은 burst 허용 방식이 다르다

Fixed window는 구현이 단순하지만 경계 직전과 직후에 요청이 몰릴 수 있습니다.

```text
12:00:59  100 requests
12:01:00  window reset
12:01:00  100 requests
```

Sliding window는 최근 일정 구간을 더 정확히 반영하고, token bucket은 일정 속도로 token을 보충하면서 제한된 burst를 허용할 수 있습니다. 어느 방식이 항상 더 좋은 것이 아니라 **허용해야 할 burst와 유지할 state 비용**이 다릅니다.

### 여러 instance에서는 quota state의 범위를 결정한다

한 process의 memory에 counter를 두면 그 instance가 본 요청만 계산합니다. 여러 application instance가 하나의 global quota를 공유해야 한다면 shared state나 gateway처럼 공통 지점에서 제한을 수행해야 할 수 있습니다.

```text
Client
  ├─► Instance A : local count 60
  └─► Instance B : local count 60

정책이 global 100/min이라면
두 local counter만으로는 실제 120 requests를 막지 못할 수 있음
```

반대로 instance별 제한이면 충분한 요구에 global distributed counter를 추가하면 네트워크 왕복, failure mode, 운영 복잡성만 늘 수 있습니다. 필요한 quota scope를 먼저 정의해야 합니다.

### Rate limit은 인증·인가를 대체하지 않는다

권한 없는 요청을 초당 5회로 줄여도 그 5회가 성공하면 authorization은 여전히 깨져 있습니다. Rate limiting은 요청 속도와 자원 소비를 제한하는 방어층이지 permission check가 아닙니다.

Limit을 넘겼을 때는 `429 Too Many Requests`를 사용할 수 있고, 필요하면 `Retry-After`로 client가 언제 다시 시도할 수 있는지 알려줄 수 있습니다. 즉 client retry 정책도 abuse-control 설계와 연결됩니다.

Rate limiting의 핵심은 `100 req/min` 같은 숫자를 외우는 것이 아니라 **어떤 공격을 어떤 주체 기준으로 늦추고, 어느 정도 burst와 정상 사용자 오탐을 허용하며, quota state를 어디까지 공유할 것인지**를 명시하는 것입니다.
