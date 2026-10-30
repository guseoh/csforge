---
kind: concept
contentKey: security.core.tokens-oauth.jwt-structure
topicContentKey: security.core.tokens-oauth
slug: jwt-structure
title: "JWT 구조와 서명 검증·암호화의 차이"
summary: "일반적인 서명된 JWT는 읽을 수 있는 헤더·페이로드와 서명으로 구성되며, 서명 검증과 발급자·대상 확인이 암호화와 어떻게 다른지 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7519"
    title: "RFC 7519: JSON Web Token (JWT)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "JWT 클레임과 JOSE 표현 형식 표준 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc8725"
    title: "RFC 8725: JSON Web Token Best Current Practices"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "서명 알고리즘 허용 목록과 토큰 검증 보안 권고 확인"
---
# JWT 구조와 서명 검증·암호화의 차이

JWT 액세스 토큰 예제를 보면 `xxxxx.yyyyy.zzzzz` 세 부분이 보여 암호화된 문자열처럼 느껴집니다. 일반적인 서명된 JWT(JWS)에서는 헤더와 내용이 **base64url 인코딩**될 뿐 비밀정보로 숨겨지는 것이 아닙니다.

```text
header.payload.signature
  │      │         │
  │      │         └─ 서명 입력에 대한 서명 또는 MAC
  │      └─ 클레임: sub, iss, aud, exp ...
  └─ alg, typ 등 메타데이터
```

누구든 토큰을 얻으면 내용을 디코딩할 수 있으므로 비밀번호, API 키, 민감 개인정보를 “JWT 안이니까 안전하다”며 넣으면 안 됩니다.

### 서명은 변조 검출과 발급자 trust에 사용된다

리소스 서버는 토큰의 서명을 검증하고 허용한 알고리즘과 키를 사용했는지 확인합니다.

```text
수신한 header.payload.signature
        │
        ├─ 허용한 alg인가?
        ├─ 신뢰하는 발급자의 키인가?
        └─ 서명이 유효한가?
```

페이로드를 디코딩했을 때 `role=ADMIN`이라고 쓰여 있다는 이유만으로 신뢰하면 공격자가 임의의 토큰을 만들 수 있습니다.

### 서명만 맞아도 모든 클레임이 유효한 것은 아니다

검증에는 보통 다음이 함께 필요합니다.

| 클레임 | 질문                               |
| ----- | ---------------------------------- |
| `iss` | 내가 신뢰하는 발급자인가?          |
| `aud` | 이 토큰이 우리 API를 위한 것인가? |
| `exp` | 만료되지 않았는가?                 |
| `nbf` | 아직 사용 전 시점은 아닌가?        |
| `sub` | 어떤 subject를 가리키는가?         |

알고리즘 혼동 공격을 막으려면 토큰 헤더의 `alg` 값을 그대로 신뢰하지 말고 서버에서 허용한 알고리즘과 키 설정을 사용해야 합니다.

### 내용을 숨기려면 암호화가 필요하다

JWE처럼 암호화된 JWT도 있지만 서명된 JWT와 구분해야 합니다. “JWT는 암호화된 토큰”이라는 설명은 틀립니다.

JWT를 이해할 때는 문자열 모양보다 **누가 발급했고, 어떤 키로 무결성을 검증하며, 어떤 클레임 조건을 만족해야 이 요청에 사용할 수 있는가**를 보는 것이 중요합니다.
