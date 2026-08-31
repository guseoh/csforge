---
kind: concept
contentKey: security.core.auth-architecture.user-details
topicContentKey: security.core.auth-architecture
slug: user-details
title: "UserDetailsService와 PasswordEncoder의 협력 경계"
summary: "사용자 계정 조회와 password verifier 비교를 분리하고 UserDetails를 domain entity 전체와 동일시하지 않으며 password hash format upgrade까지 고려하는 login 협력 구조를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details.html"
    title: "Spring Security Reference: UserDetailsService"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: DaoAuthenticationProvider와 UserDetailsService collaboration 확인
  - url: "https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html"
    title: "Spring Security Reference: Password Storage"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: PasswordEncoder와 DelegatingPasswordEncoder 확인
---
# UserDetailsService와 PasswordEncoder의 협력 경계

Password login에서 필요한 책임을 나누면 흐름이 더 명확해집니다.

```text
submitted username/password
       │
       ▼
DaoAuthenticationProvider
       │
       ├─ UserDetailsService.loadUserByUsername()
       │        └─ stored encoded password + account state + authorities
       │
       └─ PasswordEncoder.matches(raw, encoded)
                │
                └─ success / fail
```

`UserDetailsService`는 raw password를 검증하는 책임이 아니라 **저장된 사용자 인증 정보를 조회**합니다. `PasswordEncoder`가 입력과 stored verifier를 비교합니다.

### UserDetails와 domain Member는 책임이 다르다

Domain `Member` entity를 그대로 UserDetails로 구현하면 간단할 수 있지만 persistence lifecycle, lazy association, password field 노출, security framework dependency가 domain에 섞일 수 있습니다.

```java
record LoginPrincipal(
    long memberId,
    String email,
    String encodedPassword,
    Collection<GrantedAuthority> authorities
) implements UserDetails { ... }
```

이처럼 authentication에 필요한 projection을 따로 둘 수 있습니다. 프로젝트 규모와 규칙에 따라 선택하되 두 모델이 같아야 한다고 강제하지 않습니다.

### account state도 authentication 결과에 영향을 준다

잠금, disabled, credential expired 같은 상태를 UserDetails contract로 표현할 수 있습니다. 다만 실제 business 회원 상태를 framework boolean 네 개에 억지로 끼워 맞추지 말고 정책을 명확히 합니다.

### password hash format은 migration 대상이다

`{bcrypt}...`, `{argon2}...`처럼 DelegatingPasswordEncoder가 format ID를 관리하면 기존 사용자는 옛 hash로 검증하면서 새 가입/비밀번호 변경은 새 알고리즘으로 저장하는 migration이 가능합니다.

UserDetailsService/PasswordEncoder 구조의 핵심은 framework interface를 외우는 것이 아니라 **identity 조회, credential 검증, account policy를 서로 다른 책임으로 유지하는 것**입니다.
