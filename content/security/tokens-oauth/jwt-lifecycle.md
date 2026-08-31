---
kind: concept
contentKey: security.core.tokens-oauth.jwt-lifecycle
topicContentKey: security.core.tokens-oauth
slug: jwt-lifecycle
title: "JWT expiry·issuer·revocation lifecycle"
summary: "stateless signature verification이 서버의 모든 session state를 없애는 것이 아니며 access token 수명, refresh token, key rotation, logout/revocation 요구에 따라 상태와 trade-off가 다시 생김을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7519"
    title: "RFC 7519: JSON Web Token (JWT)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: exp, nbf, iss, aud 등 registered claims 확인
  - url: "https://www.rfc-editor.org/rfc/rfc9700"
    title: "RFC 9700: Best Current Practice for OAuth 2.0 Security"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: access/refresh token 보안과 현대 OAuth security guidance 확인
---
# JWT expiry·issuer·revocation lifecycle

JWT의 장점으로 “서버가 DB/session store를 조회하지 않고 signature만으로 요청을 검증할 수 있다”가 자주 언급됩니다. 하지만 이것을 **인증 시스템에 상태가 전혀 필요 없다**로 확대하면 logout, role 변경, token 탈취 대응에서 문제가 생깁니다.

### access token은 발급 시점 claim snapshot이다

```text
10:00 발급
sub=42
role=USER
exp=10:15

10:05 관리자에서 account disabled
```

Resource server가 매 요청 user DB를 조회하지 않는다면 10:15까지 token의 old claim을 계속 신뢰할 수 있습니다. 짧은 access token lifetime은 stale authorization window를 줄이는 방법입니다.

### logout은 token 파일을 지우는 것만으로 서버에서 사라지지 않는다

Client가 local token을 삭제해도 공격자가 복사본을 갖고 있다면 `exp`까지 사용할 수 있습니다. 즉시 revocation이 필요하면 denylist/token version/introspection 같은 server-side state를 도입할 수 있지만 stateless 장점이 줄어듭니다.

### refresh token은 더 오래 사는 credential이다

짧은 access token을 자주 갱신하기 위해 refresh token을 사용한다면 refresh token 탈취 위험과 rotation/reuse detection이 새 책임이 됩니다.

```text
refresh token R1 사용
   │
   ├─ R1 invalidate
   └─ R2 발급

이미 사용된 R1 재사용 감지 → token family compromise 의심
```

### key rotation도 lifecycle이다

Signing key를 바꿀 때 이미 발급된 token을 검증하기 위해 old verification key를 일정 기간 유지할 수 있습니다. `kid`와 JWKS 같은 메커니즘이 rotation을 도와주지만 key selection 자체도 신뢰된 issuer configuration 안에서 해야 합니다.

JWT를 선택하는 질문은 “세션보다 최신 기술인가?”가 아니라 **요청마다 중앙 상태 조회를 줄이는 대신 token 유효 기간 동안 stale/revocation을 어떻게 받아들일 것인가**입니다.
