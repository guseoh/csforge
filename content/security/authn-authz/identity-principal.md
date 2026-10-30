---
kind: concept
contentKey: security.core.authn-authz.identity-principal
topicContentKey: security.core.authn-authz
slug: identity-principal
title: "사용자 신원(identity)과 인증 주체(principal)"
summary: "오래 유지되는 사용자 신원과 현재 요청에서 이를 표현하는 인증 주체를 구분하고, 변경 가능한 이메일을 영구 식별자로 사용하지 않는 이유를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html"
    title: "Spring Security Reference: Authentication Architecture"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Authentication의 principal과 SecurityContext의 역할 확인"
---
# 사용자 신원(identity)과 인증 주체(principal)

사용자 신원(identity)은 시스템이 장기적으로 “누구인가”를 식별하는 기준입니다. 인증 주체(principal)는 **현재 요청의 보안 컨텍스트에서 그 사용자를 나타내는 객체**입니다. 두 개념은 연결되지만 수명과 역할이 다릅니다.

```text
실제 사용자 신원
memberId = 42
      │
      ▼ 인증 성공 후 표현
Principal / Authentication
├─ principal: UserDetails(memberId=42, email=...)
├─ authorities: ROLE_USER
└─ authenticated: true
```

### 이메일이 신원인지 속성인지 구분한다

이메일로 로그인하더라도 사용자가 이메일을 변경할 수 있다면 내부 신원으로는 안정적인 `memberId`가 더 적합할 수 있습니다.

```text
memberId 42
email a@example.com → b@example.com

같은 사용자 신원
```

인가와 감사 기록에 변경 가능한 이메일만 저장하면 과거 기록이 현재 사용자와 연결되지 않을 수 있습니다.

### 인증 주체에 도메인 엔티티 전체를 넣는 것도 신중해야 한다

Hibernate 엔티티를 그대로 인증 주체에 넣으면 직렬화, 세션 수명, 지연 로딩, 오래된 데이터 같은 영속성 문제가 보안 컨텍스트까지 번질 수 있습니다. 인증에 필요한 정보만 담은 작은 표현 객체를 두면 경계가 명확해집니다.

### 인증 주체는 클라이언트가 보내는 memberId가 아니다

요청 본문에 `memberId=42`가 있다고 해서 이를 현재 사용자로 신뢰하면 안 됩니다. 현재 인증 주체는 서버가 인증한 뒤 만든 보안 컨텍스트에서 얻어야 합니다.

두 개념을 구분하면 로그인 이름이 바뀌어도 같은 사용자를 추적하고, 감사 기록과 소유권 비교에 일관된 식별자를 사용할 수 있습니다.
