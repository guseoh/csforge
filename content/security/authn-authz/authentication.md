---
kind: concept
contentKey: security.core.authn-authz.authentication
topicContentKey: security.core.authn-authz
slug: authentication
title: "Authentication이 주체를 확인하는 과정"
summary: "credential을 받아 저장된 verifier와 검증하고 성공한 identity를 security context로 옮기는 흐름을 이해하며 로그인 성공이 모든 resource 접근 권한을 뜻하지 않음을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/index.html"
    title: "Spring Security Reference: Username/Password Authentication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: username/password authentication 흐름 확인
---
# Authentication이 주체를 확인하는 과정

Authentication은 “로그인 화면을 보여 주는 기능”이 아니라 **제시된 credential이 어떤 identity에 해당하는지 검증하는 과정**입니다.

비밀번호 로그인 흐름을 단순화하면 다음과 같습니다.

```text
POST /login
email + password
      │
      ▼
Authentication filter
      │ unauthenticated token
      ▼
AuthenticationManager
      │
      ▼
UserDetailsService / user lookup
      │
      ▼
PasswordEncoder.matches(raw, encoded)
      │
      ├─ 실패 → 인증 실패
      └─ 성공 → authenticated Authentication
                     │
                     ▼
               SecurityContext
```

서버는 저장된 password hash를 복호화해 원문과 비교하는 것이 아니라 password hashing function으로 raw 입력을 검증합니다.

### 인증과 인가는 다른 질문이다

```text
Authentication: 이 요청 주체가 member 42인가?
Authorization : member 42가 order 900을 취소할 수 있는가?
```

로그인에 성공해도 관리자 endpoint나 다른 사용자의 주문에 자동 접근할 수 있는 것은 아닙니다.

### 실패 응답은 account enumeration도 고려한다

“이 이메일은 존재하지 않습니다”와 “비밀번호가 틀렸습니다”를 로그인 API에서 지나치게 구체적으로 구분하면 공격자가 가입 계정 목록을 수집하는 데 이용할 수 있습니다. UX와 threat model에 따라 외부 메시지는 통합하고 내부 로그는 필요한 진단 정보를 남기는 방식을 검토합니다.

### MFA도 authentication 단계의 강도를 높이는 방법이다

비밀번호 하나가 탈취되어도 추가 factor를 요구하면 공격 난이도를 높일 수 있습니다. 다만 MFA가 resource-level authorization을 대체하지는 않습니다.

Authentication의 결과는 “누구인지 확인된 주체”이지 **그 주체가 무엇이든 할 수 있다는 허가증**이 아닙니다.
