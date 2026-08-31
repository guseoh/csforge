---
kind: concept
contentKey: security.core.auth-architecture.manager-provider
topicContentKey: security.core.auth-architecture
slug: manager-provider
title: "AuthenticationManager와 AuthenticationProvider 위임 구조"
summary: "ProviderManager가 Authentication type을 처리할 수 있는 provider를 찾아 인증을 위임하고 password·OTP·custom token 등 서로 다른 검증 방식을 같은 authentication pipeline에 조합하는 구조를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-providermanager"
    title: "Spring Security Reference: ProviderManager"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: ProviderManager와 AuthenticationProvider delegation 동작 확인
---
# AuthenticationManager와 AuthenticationProvider 위임 구조

애플리케이션에 비밀번호 로그인, API key, OTP 같은 인증 방식이 여러 개 생기면 하나의 거대한 `if credentialType` service에 모두 넣기보다 **각 credential 검증 책임을 provider로 분리**할 수 있습니다.

```text
AuthenticationManager
      │
      ▼
ProviderManager
      │
      ├─ DaoAuthenticationProvider
      │    └─ username/password 처리
      │
      ├─ ApiKeyAuthenticationProvider
      │    └─ API key token 처리
      │
      └─ OtpAuthenticationProvider
           └─ OTP token 처리
```

### Provider는 자신이 처리할 Authentication type을 선언한다

```java
@Override
public boolean supports(Class<?> authentication) {
    return ApiKeyAuthenticationToken.class.isAssignableFrom(authentication);
}
```

ProviderManager는 compatible provider에 인증을 요청합니다. Provider가 성공한 Authentication을 반환하면 그 결과가 이후 context에 사용됩니다.

### user lookup과 password compare가 provider 내부 협력이다

`DaoAuthenticationProvider`는 `UserDetailsService`와 `PasswordEncoder`를 이용해 사용자 조회와 password 검증을 수행합니다. 그래서 controller나 login service가 직접 DB query + bcrypt compare + SecurityContext 저장을 모두 소유할 필요가 없습니다.

### 여러 provider가 있다고 모든 provider를 순서대로 성공시켜야 하는 것은 아니다

각 token type에 맞는 provider를 선택하는 delegation 구조이며 MFA처럼 여러 factor를 단계적으로 요구하는 flow는 별도의 authentication sequence/state로 설계할 수 있습니다.

### 실패 이유 노출도 경계다

Provider 내부에서는 username not found와 bad credentials를 구분할 수 있어도 외부 login response에서 그대로 노출하면 account enumeration에 이용될 수 있습니다. provider exception과 client-visible error contract를 분리합니다.

AuthenticationManager/Provider 구조의 목적은 abstraction 자체가 아니라 **credential 종류별 검증 책임을 교체·조합하면서 성공 결과를 일관된 Authentication으로 만드는 것**입니다.
