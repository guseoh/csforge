---
kind: concept
contentKey: security.core.tokens-oauth.oauth-oidc
topicContentKey: security.core.tokens-oauth
slug: oauth-oidc
title: "OAuth 2.0과 OpenID Connect의 목적 차이"
summary: "OAuth를 resource access delegation framework로, OIDC를 그 위의 authentication identity layer로 구분하고 authorization code + PKCE 흐름에서 access token과 ID token의 대상이 다름을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6749"
    title: "RFC 6749: OAuth 2.0 Authorization Framework"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: OAuth roles와 authorization code flow 기본 표준 확인
  - url: "https://www.rfc-editor.org/rfc/rfc7636"
    title: "RFC 7636: Proof Key for Code Exchange (PKCE)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: authorization code interception 방어용 PKCE 확인
  - url: "https://openid.net/specs/openid-connect-core-1_0.html"
    title: "OpenID Connect Core 1.0"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: ID Token과 OIDC authentication layer 확인
---
# OAuth 2.0과 OpenID Connect의 목적 차이

“구글 OAuth 로그인”이라는 표현 때문에 OAuth 자체가 login protocol이라고 생각하기 쉽습니다. OAuth 2.0의 핵심은 **resource owner가 client에게 protected resource 접근 권한을 위임**하는 것이고, OpenID Connect(OIDC)는 OAuth 2.0 위에 identity/authentication 정보를 표준화한 layer를 추가합니다.

### authorization code flow의 역할을 나눈다

```text
User Browser
    │
    ▼
Client ── authorize request ──► Authorization Server
  ▲                                 │
  │        authorization code       │
  └─────────────────────────────────┘
  │
  ├─ code + PKCE verifier ─────────► Token Endpoint
  │                                  │
  │   access token (+ ID token)      │
  ◄──────────────────────────────────┘
```

PKCE는 intercepted authorization code만 탈취한 공격자가 token으로 교환하는 것을 어렵게 합니다.

### access token과 ID token은 audience가 다르다

```text
Access Token
Client ─────────► Resource Server(API)
목적: API access authorization

ID Token
Authorization Server ─────────► Client
목적: 사용자가 어떻게 인증됐는지에 대한 identity claims
```

Client가 ID token을 API bearer credential처럼 보내거나, API가 access token payload를 client profile로 오해하면 token purpose가 섞입니다.

### OIDC는 `id_token` 검증이 핵심이다

Client는 issuer, audience/client ID, signature, expiry, nonce 등 protocol 요구를 검증해야 합니다. 단순히 JWT payload의 email을 decode해 로그인 처리하면 안 됩니다.

### OAuth authorization과 application authorization은 또 다르다

Google이 “이 사용자가 누구인지” 알려 주고 access token scope를 발급해도 우리 서비스의 `ADMIN`, 주문 ownership 같은 domain permission은 우리 서버가 별도로 결정합니다.

OAuth/OIDC를 이해할 때 endpoint 이름보다 **누가 resource owner이고, client가 무엇을 위임받으며, 어떤 token을 어느 party가 소비하는지**를 역할별로 그리는 것이 가장 중요합니다.
