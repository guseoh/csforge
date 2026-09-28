---
kind: concept
contentKey: security.core.auth-architecture.user-details
topicContentKey: security.core.auth-architecture
slug: user-details
title: "사용자 조회(UserDetailsService)와 비밀번호 검증(PasswordEncoder)의 협력 경계"
summary: "`UserDetailsService`의 사용자 조회와 `PasswordEncoder`의 비밀번호 검증을 구분하고, 계정 상태와 비밀번호 해시 형식 변경까지 고려한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details.html"
    title: "Spring Security Reference: UserDetailsService"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "DaoAuthenticationProvider와 UserDetailsService의 협력 확인"
  - url: "https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html"
    title: "Spring Security Reference: Password Storage"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "PasswordEncoder와 DelegatingPasswordEncoder의 역할 확인"
---
# 사용자 조회(UserDetailsService)와 비밀번호 검증(PasswordEncoder)의 협력 경계

비밀번호 로그인에 필요한 책임을 나누면 흐름이 명확해집니다.

```text
제출된 사용자 이름과 비밀번호
       │
       ▼
DaoAuthenticationProvider
       │
       ├─ UserDetailsService.loadUserByUsername()
       │        └─ 저장된 비밀번호 해시 + 계정 상태 + 권한
       │
       └─ PasswordEncoder.matches(입력, 저장된 해시)
                │
                └─ 성공 / 실패
```

`UserDetailsService`는 **저장된 사용자 인증 정보를 조회**하고, `PasswordEncoder`는 입력 비밀번호와 저장된 해시를 비교합니다.

### UserDetails와 도메인 Member는 책임이 다르다

도메인 `Member` 엔티티를 그대로 `UserDetails`로 구현하면 영속성 수명주기, 지연 로딩, 비밀번호 필드 노출, 보안 프레임워크 의존성이 도메인에 섞일 수 있습니다.

```java
record LoginPrincipal(
    long memberId,
    String email,
    String encodedPassword,
    Collection<GrantedAuthority> authorities
) implements UserDetails { ... }
```

인증에 필요한 정보만 담은 별도 표현을 둘 수 있습니다. 프로젝트의 규모와 규칙에 따라 선택하되 두 모델이 반드시 같아야 하는 것은 아닙니다.

### 계정 상태도 인증 결과에 영향을 준다

잠금·비활성화·자격 증명 만료 같은 상태를 `UserDetails`로 표현할 수 있습니다. 다만 서비스의 계정 상태를 프레임워크의 불리언 속성에 억지로 맞추지 말고 각 정책을 명확히 정의해야 합니다.

### 비밀번호 해시 형식도 점진적으로 바꿀 수 있다

`DelegatingPasswordEncoder`가 `{bcrypt}...`, `{argon2}...` 같은 형식 식별자를 관리하면 기존 해시를 계속 검증하면서 신규 가입이나 비밀번호 변경 시 새 알고리즘으로 저장할 수 있습니다.

`UserDetailsService`와 `PasswordEncoder`는 **사용자 조회와 비밀번호 검증을 구분하는 협력자**입니다. 계정 상태 판단도 별도 정책으로 명확히 다뤄야 합니다.
