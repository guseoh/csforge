---
kind: concept
contentKey: security.core.auth-architecture.authentication-token
topicContentKey: security.core.auth-architecture
slug: authentication-token
title: "인증 객체(Authentication)의 검증 전·후 상태"
summary: "Spring Security의 `Authentication`이 인증 전에는 검증되지 않은 자격 증명을, 인증 후에는 검증된 사용자와 권한을 나타내는 상태 변화를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-authentication"
    title: "Spring Security Reference: Authentication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Authentication의 principal·credentials·authorities·authenticated 필드 역할 확인"
---
# 인증 객체(Authentication)의 검증 전·후 상태

Spring Security의 `Authentication`은 로그인 완료 후의 사용자 정보만 뜻하지 않습니다. 같은 인터페이스가 **검증 전 자격 증명을 담은 요청**과 **검증 완료 후의 인증 결과**를 모두 나타낼 수 있습니다.

### 로그인 입력은 아직 신뢰할 수 없는 토큰이다

```text
사용자 이름/비밀번호 요청
       │
       ▼
UsernamePasswordAuthenticationToken
인증 주체   = 제출된 사용자 이름
credentials = 원문 비밀번호
authenticated = false
       │
       ▼
AuthenticationManager
```

이 시점의 인증 주체 문자열은 사용자가 제출한 입력일 뿐 검증된 신원이 아닙니다.

### 제공자가 자격 증명을 검증한 뒤 결과를 만든다

```text
AuthenticationProvider
  ├─ 사용자 조회
  ├─ 비밀번호 비교
  └─ 권한 목록 조회
       │
       ▼
인증 완료된 Authentication
인증 주체   = 검증된 UserDetails
credentials = 검증 후 제거 가능
authorities = ROLE_USER ...
authenticated = true
```

성공 결과가 `SecurityContext`에 저장되면 이후 인가는 검증된 주체와 권한을 사용합니다.

### `setAuthenticated(true)`를 애플리케이션이 임의로 호출하면 안 된다

사용자 입력을 검증 없이 인증 완료 상태로 바꿔 보안 컨텍스트에 넣으면 인증 경계를 우회합니다. 인증 완료 결과는 `AuthenticationManager`와 제공자의 검증을 거쳐 만들어야 합니다.

### 제출된 자격 증명은 오래 보관하지 않는다

원문 비밀번호는 인증 시점에만 필요합니다. 인증 후 자격 증명을 지우면 노출 위험을 줄일 수 있으며, Spring Security의 `ProviderManager`도 설정에 따라 이를 지원합니다.

`Authentication`을 이해할 때는 **신뢰할 수 없는 입력 → 제공자의 검증 → 인증된 주체와 권한**으로 바뀌는 상태를 따라가야 합니다.
