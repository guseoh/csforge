---
kind: concept
contentKey: security.core.abuse.rate-limit
topicContentKey: security.core.abuse
slug: rate-limit
title: "Rate limiting과 abuse control"
summary: "로그인 brute force·expensive API abuse에서 identity별 요청량에 상한을 두고 fixed/sliding/token bucket 같은 정책의 burst 특성과 single-instance·distributed 상태 저장 trade-off를 이해한다."
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

비밀번호 hash를 강하게 만들었어도 공격자가 로그인 endpoint를 초당 수천 번 호출할 수 있다면 online brute force와 CPU 자원 고갈 문제가 남습니다. Rate limiting은 **특정 identity/IP/API key 등의 요청 빈도에 제한을 두어 abuse 비용을 높이고 서버 자원을 보호**합니다.

### 어떤 key로 제한할지가 먼저다

```text
IP 기준
  + 구현 단순
  - NAT 뒤 정상 사용자들이 함께 차단될 수 있음

Account/email 기준
  + 특정 계정 brute-force 제한
  - 공격자가 여러 계정으로 분산 가능

Authenticated user/API key 기준
  + 사용자별 quota에 적합
```

실전에서는 여러 signal을 조합할 수 있습니다.

### fixed window는 경계에서 burst가 생길 수 있다

```text
12:00:59  100 requests
12:01:00  window reset
12:01:00  100 requests
```

짧은 시간에 200개가 몰릴 수 있습니다. Sliding window나 token bucket은 더 부드러운 burst control을 제공하지만 상태와 구현 복잡성이 증가합니다.

### single-user/local app에 Redis가 필수는 아니다

단일 instance에서는 in-memory limiter도 충분할 수 있습니다. 여러 instance가 같은 global quota를 공유해야 할 때 shared store나 gateway-level limiter가 필요해집니다. **미래 scale을 이유로 처음부터 distributed counter를 도입하지 않습니다.**

### rate limit은 authentication/authorization을 대체하지 않는다

공격을 초당 5번으로 줄여도 권한이 없는 요청이 성공하면 보안은 깨집니다. Rate limit은 abuse 속도를 제한하는 추가 층입니다.

### client contract도 설계한다

Limit 초과 시 `429 Too Many Requests`와 적절한 `Retry-After`/rate limit metadata를 제공할 수 있습니다. 정상 client가 무한 즉시 retry하지 않도록 backoff guidance와 함께 봅니다.

Rate limiting의 핵심은 숫자 `100 req/min`이 아니라 **어떤 abuse를 어떤 identity 기준으로 얼마만큼 늦추고, 정상 사용자 burst를 얼마나 허용할지**를 product/operation 요구로 정하는 것입니다.
