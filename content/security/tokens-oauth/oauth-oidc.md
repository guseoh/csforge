---
kind: concept
contentKey: security.core.tokens-oauth.oauth-oidc
topicContentKey: security.core.tokens-oauth
slug: oauth-oidc
title: "권한 위임(OAuth 2.0)과 사용자 인증(OpenID Connect)의 목적 차이"
summary: "OAuth 2.0의 권한 위임과 OIDC의 사용자 인증을 구분하고, 인가 코드·PKCE 검증 흐름과 액세스 토큰·ID 토큰의 사용 대상을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6749"
    title: "RFC 6749: OAuth 2.0 Authorization Framework"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "OAuth 역할과 인가 코드 흐름의 기본 표준 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc7636"
    title: "RFC 7636: Proof Key for Code Exchange (PKCE)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "인가 코드 가로채기 방어를 위한 PKCE 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc9700"
    title: "RFC 9700: Best Current Practice for OAuth 2.0 Security"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "인가 코드 흐름에서 PKCE의 현재 보안 권고와 클라이언트별 요구 확인"
  - url: "https://openid.net/specs/openid-connect-core-1_0.html"
    title: "OpenID Connect Core 1.0"
    referenceType: OFFICIAL
    language: en
    displayOrder: 4
    relationNote: "ID 토큰과 OIDC 인증 계층 확인"
---
# 권한 위임(OAuth 2.0)과 사용자 인증(OpenID Connect)의 목적 차이

“구글 OAuth 로그인”이라는 표현 때문에 OAuth 자체를 로그인 프로토콜로 오해하기 쉽습니다. OAuth 2.0은 **리소스 소유자가 클라이언트에 리소스 접근 권한을 위임**하는 체계입니다. OpenID Connect(OIDC)는 OAuth 2.0 위에 사용자 인증 결과를 전달하는 표준을 더합니다.

### 인가 코드와 PKCE의 검증 흐름

```text
클라이언트: 무작위 code_verifier 생성
     │
     ├─ code_challenge = BASE64URL(SHA256(code_verifier))
     │
     └─ 인증 요청(code_challenge, S256) ──► 인가 서버
                                              │
               인가 코드 ◄─────────────────────┘
     │
     └─ 토큰 요청(인가 코드, code_verifier) ──► 토큰 엔드포인트
                                              │
                 challenge 재계산·비교 ────────┤
               액세스 토큰(+ ID 토큰) ◄────────┘
```

클라이언트는 인가 요청 전에 예측하기 어려운 `code_verifier`를 만들고 그 값에서 `code_challenge`를 계산합니다. 인가 서버는 인가 코드와 챌린지를 연결해 보관합니다. 토큰 요청이 오면 서버가 제출된 검증자로 챌린지를 다시 계산해 비교하므로, 코드를 가로챈 공격자는 검증자 없이 토큰으로 교환할 수 없습니다. OAuth 보안 모범 사례(RFC 9700)는 공개 클라이언트에 PKCE를 요구하고 기밀 클라이언트에도 권고하며, 검증자를 직접 노출하지 않는 `S256` 방식을 권고합니다.

### 인가 코드가 브라우저를 지나 API 호출까지 이어지는 전체 경계

다음은 사용자(리소스 소유자)가 브라우저(user agent)를 통해 클라이언트에 권한을 위임하는 인가 코드 흐름입니다. 클라이언트는 인가 서버(Authorization Server, AS)와 리소스 서버(Resource Server, RS)를 별도 신뢰 경계로 다뤄야 합니다.

```text
사용자·브라우저        Client 앱                AS                    RS(API)
     │                   │                    │                      │
     │ 로그인/연결 요청  ─►│                    │                      │
     │◄── 302 AS authorize (client_id, redirect_uri, scope,
     │                    state 또는 적절한 CSRF 바인딩, code_challenge)
     ├────── 로그인·동의 (AS에서) ──────────►│                      │
     │◄───────── 302 redirect_uri?code=... ──┤                      │
     ├── callback(code, state 등) ─►│        │                      │
     │                   ├── token endpoint: code + code_verifier + client/redirect binding
     │                   │───────────────────►│                      │
     │                   │◄──── access token ─┤                      │
     │                   │ (+ OIDC면 ID token) │                      │
     │                   ├──────────── access token ────────────────►│
     │                   │◄────────── 리소스 응답 ───────────────────┤
```

**인가 코드(code)**는 브라우저를 경유해 클라이언트의 redirect callback으로 돌아오지만, 일반적으로 **토큰 교환은 클라이언트가 AS의 토큰 엔드포인트와 수행하는 별도 요청**입니다. AS는 코드가 올바른 클라이언트·redirect URI 및 PKCE 챌린지와 연결되어 있는지 검증합니다. 클라이언트는 응답이 자신이 시작한 로그인/위임 요청에 속하는지 검사하고, 여러 AS를 쓴다면 발급자 혼동(mix-up)에 대한 방어도 필요합니다.

RFC 9700은 클라이언트의 callback CSRF 방어를 요구하되, **항상 `state`, PKCE, OIDC `nonce` 세 가지를 동시에 필수로 요구하지는 않습니다.** AS의 PKCE 지원을 확실히 검증하고 요청별 verifier를 사용자 에이전트에 안전하게 묶었다면 PKCE가 CSRF 방어를 제공할 수 있고, OIDC의 해당 `nonce` 검증이나 적절히 바인딩한 일회용 `state`도 프로토콜 조건에 따라 사용됩니다. 그러나 `state`를 앱 내부 이동 상태로 사용하는 경우에는 그 값의 변조·교체 위험을 별도로 통제해야 합니다. OIDC `nonce`를 쓴다면 발급받은 ID 토큰의 값과 반드시 대조해야 하며, **PKCE와 nonce의 목적·제약이 항상 동일하다고 일반화하면 안 됩니다.**

### 액세스 토큰과 ID 토큰은 사용 대상이 다르다

```text
액세스 토큰
클라이언트 ─────────► 리소스 서버(API)
목적: API 접근 권한 위임

ID 토큰
인가 서버 ─────────► 클라이언트
목적: 사용자 인증 결과 전달
```

클라이언트가 ID 토큰을 API 호출용 자격 증명으로 보내거나, API가 액세스 토큰의 내용을 사용자 프로필로 해석하면 두 토큰의 목적을 혼동한 것입니다.

### OIDC는 `id_token` 검증이 핵심이다

클라이언트는 발급자, 대상 클라이언트 ID, 서명, 만료, `nonce` 등 프로토콜이 요구하는 조건을 검증해야 합니다. JWT의 내용을 디코딩해 이메일만 읽고 로그인 처리해서는 안 됩니다.

### OAuth 권한 위임과 서비스 내부 인가도 구분한다

외부 제공자가 사용자 인증 결과와 액세스 토큰의 권한 범위를 전달해도, 우리 서비스의 `ADMIN` 권한이나 주문 소유권은 우리 서버가 별도로 판단합니다.

OAuth/OIDC를 이해할 때는 **누가 리소스 소유자인지, 클라이언트가 어떤 권한을 위임받는지, 각 토큰을 누가 사용하는지** 구분해야 합니다.
