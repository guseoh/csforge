---
kind: concept
contentKey: security.core.auth-architecture.authentication-token
topicContentKey: security.core.auth-architecture
slug: authentication-token
title: "Authentication 객체의 검증 전·후 상태"
summary: "Spring Security Authentication이 principal·credentials·authorities를 운반하며 login input 단계의 unauthenticated token과 provider 검증 후 authenticated token의 의미가 다름을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-authentication"
    title: "Spring Security Reference: Authentication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Authentication의 principal, credentials, authorities, authenticated 역할 확인
---
# Authentication 객체의 검증 전·후 상태

Spring Security의 `Authentication`을 “로그인된 사용자 객체”라고만 부르면 login 시작 단계에서 왜 Authentication 객체를 만드는지 이해하기 어렵습니다. 같은 interface가 **검증 요청을 운반하는 token**과 **검증 완료된 현재 principal** 두 역할에 사용될 수 있습니다.

### 로그인 입력은 아직 신뢰할 수 없는 token이다

```text
username/password request
       │
       ▼
UsernamePasswordAuthenticationToken
principal   = submitted username
credentials = raw password
authenticated = false
       │
       ▼
AuthenticationManager
```

이 시점의 principal 문자열은 사용자가 제출한 input일 뿐 검증된 identity가 아닙니다.

### provider가 credential을 검증한 뒤 결과를 만든다

```text
AuthenticationProvider
  ├─ user lookup
  ├─ password matches
  └─ authorities load
       │
       ▼
Authenticated Authentication
principal   = verified UserDetails
credentials = 보통 erase 가능
authorities = ROLE_USER ...
authenticated = true
```

성공 결과가 `SecurityContext`에 저장되면 이후 authorization이 이 authorities/principal을 사용합니다.

### `setAuthenticated(true)`를 application이 임의로 호출하면 안 된다

사용자 input object를 검증 없이 authenticated 상태로 만들어 context에 넣으면 authentication boundary 자체를 우회하는 것입니다. 신뢰 상태 전이는 AuthenticationManager/Provider의 검증 결과로 만들어야 합니다.

### credentials는 오래 보관하지 않는 편이 좋다

Raw password는 authentication 순간에만 필요하므로 성공 후 credentials를 erase하는 것이 exposure를 줄입니다. Spring Security의 ProviderManager는 설정에 따라 credentials erase를 지원합니다.

Authentication 객체를 이해할 때는 class 이름보다 **untrusted credential carrier → verifier → trusted principal representation**이라는 상태 전이를 보는 것이 핵심입니다.
