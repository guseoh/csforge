---
kind: concept
contentKey: security.core.authn-authz.identity-principal
topicContentKey: security.core.authn-authz
slug: identity-principal
title: "Identity와 principal"
summary: "사용자라는 실제 identity와 현재 요청에서 그 주체를 표현하는 principal을 구분하고 username/email 같은 mutable attribute를 영구 identity로 오해하지 않는다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html"
    title: "Spring Security Reference: Authentication Architecture"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Authentication principal과 SecurityContext의 역할 확인
---
# Identity와 principal

로그인한 사용자를 코드에서 `principal`이라고 부르는 경우가 많지만 identity와 principal은 같은 단어가 아닙니다. Identity는 시스템이 “누구인가”를 식별하는 개념이고, principal은 **현재 security context에서 그 주체를 표현하는 객체/표현**입니다.

```text
실제 사용자 identity
memberId = 42
      │
      ▼ 인증 성공 후 표현
Principal / Authentication
├─ principal: UserDetails(memberId=42, email=...)
├─ authorities: ROLE_USER
└─ authenticated: true
```

### email이 identity인지 attribute인지 구분한다

email로 로그인하더라도 사용자가 email을 변경할 수 있다면 내부 identity로는 안정적인 `memberId`가 더 적합할 수 있습니다.

```text
memberId 42
email a@example.com → b@example.com

같은 사용자 identity
```

Authorization과 audit에서 mutable email 문자열만 저장하면 과거 기록과 현재 사용자 연결이 애매해질 수 있습니다.

### principal에 domain entity 전체를 넣는 것도 신중해야 한다

Hibernate Entity를 그대로 principal에 넣으면 serialization/session lifecycle, lazy loading, stale state 같은 persistence concern이 security context까지 번질 수 있습니다. 인증에 필요한 작은 immutable projection을 두는 편이 경계를 명확하게 만들 수 있습니다.

### principal은 client가 보내는 memberId가 아니다

Request body에 `memberId=42`가 있다고 해서 그 값을 현재 사용자 principal로 신뢰하면 안 됩니다. 현재 authenticated principal은 서버가 검증한 security context에서 얻습니다.

Identity/principal을 구분하면 “로그인 이름이 바뀌면 같은 사용자인가?”, “audit에는 무엇을 기록할까?”, “ownership 비교는 어떤 key로 할까?” 같은 backend 설계가 선명해집니다.
