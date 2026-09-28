---
kind: concept
contentKey: security.core.auth-architecture.manager-provider
topicContentKey: security.core.auth-architecture
slug: manager-provider
title: "인증 관리자와 제공자(AuthenticationManager·AuthenticationProvider)의 위임 구조"
summary: "`ProviderManager`가 인증 요청 유형에 맞는 `AuthenticationProvider`에 검증을 위임하고 비밀번호·OTP·API 키 같은 방식을 조합하는 구조를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-providermanager"
    title: "Spring Security Reference: ProviderManager"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "ProviderManager가 AuthenticationProvider에 인증을 위임하는 동작 확인"
---
# 인증 관리자와 제공자(AuthenticationManager·AuthenticationProvider)의 위임 구조

비밀번호·API 키·OTP처럼 인증 방식이 여러 개라면 각 자격 증명의 검증 책임을 별도 `AuthenticationProvider`로 나눌 수 있습니다.

```text
AuthenticationManager
      │
      ▼
ProviderManager
      │
      ├─ DaoAuthenticationProvider
      │    └─ 사용자 이름/비밀번호 처리
      │
      ├─ ApiKeyAuthenticationProvider
      │    └─ API 키 토큰 처리
      │
      └─ OtpAuthenticationProvider
           └─ OTP 토큰 처리
```

### 제공자는 자신이 처리할 인증 요청 유형을 선언한다

```java
@Override
public boolean supports(Class<?> authentication) {
    return ApiKeyAuthenticationToken.class.isAssignableFrom(authentication);
}
```

`ProviderManager`는 요청 유형을 지원하는 제공자에 인증을 위임합니다. 제공자가 검증된 `Authentication`을 반환하면 이후 보안 컨텍스트에서 그 결과를 사용합니다.

### 사용자 조회와 비밀번호 비교는 제공자 안에서 협력한다

`DaoAuthenticationProvider`는 `UserDetailsService`로 사용자를 조회하고 `PasswordEncoder`로 입력 비밀번호를 검증합니다. 컨트롤러가 직접 DB 조회와 비밀번호 비교, 보안 컨텍스트 저장을 모두 수행할 필요는 없습니다.

### 여러 제공자가 있다고 모든 제공자를 순서대로 성공시켜야 하는 것은 아니다

제공자 선택은 인증 요청 유형에 따라 위임하는 구조입니다. 다중 요소 인증(MFA)처럼 여러 검증 단계를 요구하는 흐름은 별도로 설계해야 합니다.

### 실패 이유 노출도 경계다

제공자 내부에서는 사용자 없음과 비밀번호 불일치를 구분하더라도, 외부 응답에서 이를 그대로 드러내면 가입된 계정을 알아내는 데 악용될 수 있습니다. 내부 진단 정보와 외부 오류 메시지를 구분합니다.

`AuthenticationManager`와 제공자는 **자격 증명 종류별 검증 책임을 나누고 성공 결과를 일관된 `Authentication`으로 전달**합니다.
