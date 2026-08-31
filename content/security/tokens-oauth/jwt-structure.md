---
kind: concept
contentKey: security.core.tokens-oauth.jwt-structure
topicContentKey: security.core.tokens-oauth
slug: jwt-structure
title: "JWT 구조와 signed != encrypted"
summary: "JWT의 header·payload·signature/JWS 구조에서 base64url encoding이 암호화가 아니며 signature 검증은 변조 여부와 issuer 신뢰를 확인하는 과정이라는 점을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7519"
    title: "RFC 7519: JSON Web Token (JWT)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JWT claims와 JOSE representation 표준 확인
---
# JWT 구조와 signed != encrypted

JWT access token 예제를 보면 `xxxxx.yyyyy.zzzzz` 세 부분이 보여 암호화된 문자열처럼 느껴집니다. 일반적인 signed JWT(JWS)에서는 header와 payload가 **base64url encoding**될 뿐 secret으로 숨겨지는 것이 아닙니다.

```text
header.payload.signature
  │      │         │
  │      │         └─ signing input에 대한 signature/MAC
  │      └─ claims: sub, iss, aud, exp ...
  └─ alg, typ 등 metadata
```

누구든 token을 얻으면 payload를 decode할 수 있으므로 password, API key, 민감 개인정보를 “JWT 안이니까 안전하다”며 넣으면 안 됩니다.

### signature는 변조 검출과 issuer trust에 사용된다

Resource server는 token의 signature를 검증하고 허용한 algorithm/key인지 확인합니다.

```text
received header.payload.signature
        │
        ├─ allowed alg?
        ├─ known issuer key?
        └─ signature valid?
```

Payload를 decode해 `role=ADMIN`이라고 쓰여 있다는 사실만으로 신뢰하면 공격자가 임의 token을 만들 수 있습니다.

### signature만 맞아도 모든 claim이 유효한 것은 아니다

검증에는 보통 다음이 함께 필요합니다.

| claim | 질문                               |
| ----- | ---------------------------------- |
| `iss` | 내가 신뢰하는 issuer인가?          |
| `aud` | 이 token이 우리 API를 위한 것인가? |
| `exp` | 만료되지 않았는가?                 |
| `nbf` | 아직 사용 전 시점은 아닌가?        |
| `sub` | 어떤 subject를 가리키는가?         |

Algorithm confusion을 피하기 위해 token header가 요청한 어떤 alg든 무조건 받아들이지 않고 server-side allowlist와 key configuration을 사용합니다.

### encryption이 필요하면 별도 메커니즘이다

JWE처럼 encrypted JWT 표준도 존재하지만 단순 signed JWT와 구분해야 합니다. “JWT = encrypted token”은 잘못된 설명입니다.

JWT를 이해할 때는 문자열 모양보다 **누가 발급했고, 어떤 key로 무결성을 검증하며, 어떤 claim 조건을 만족해야 이 request에 사용할 수 있는가**를 보는 것이 중요합니다.
