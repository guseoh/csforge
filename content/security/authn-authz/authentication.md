---
kind: concept
contentKey: security.core.authn-authz.authentication
topicContentKey: security.core.authn-authz
slug: authentication
title: "인증(authentication)이 주체를 확인하는 과정"
summary: "제출된 자격 증명을 저장된 정보와 검증해 요청 주체를 인증하는 흐름을 이해하고, 로그인 성공과 리소스 접근 권한을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/index.html"
    title: "Spring Security Reference: Username/Password Authentication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "사용자 이름과 비밀번호를 이용한 인증 흐름 확인"
---
# 인증(authentication)이 주체를 확인하는 과정

Authentication은 “로그인 화면을 보여 주는 기능”이 아니라 **제시된 자격 증명이 어떤 신원에 해당하는지 검증하는 과정**입니다.

비밀번호 로그인 흐름을 단순화하면 다음과 같습니다.

```text
POST /login
이메일 + 비밀번호
      │
      ▼
Authentication 필터
      │ 인증 전 토큰(authenticated=false)
      ▼
AuthenticationManager
      │
      ▼
UserDetailsService / 사용자 조회
      │
      ▼
계정·자격 증명 상태 검사 (잠김/비활성/만료 등)
      │ 실패 → 인증 실패
      ▼
PasswordEncoder.matches(원문, 저장된 해시)
      │ 불일치 → 인증 실패
      ▼
비밀번호 외 필수 인증 검사 완료 (자격 증명 만료 등)
      │ 실패 → 인증 실패
      ▼
AuthenticationManager가 완료된 Authentication 반환
      │
      ▼
인증 성공 처리를 담당하는 필터가 SecurityContext에 설정
```

서버는 저장된 비밀번호 해시를 복호화하지 않습니다. `PasswordEncoder.matches(raw, encoded)`는 입력 비밀번호가 저장된 해시와 일치하는지를 검사하지만, **일치했다는 사실만으로 인증 성공이 확정되지는 않습니다.** 예를 들어 `DaoAuthenticationProvider` 기반 흐름에서는 계정 잠금·비활성화·계정 만료를 사전에, 자격 증명 만료 등을 별도로 검사할 수 있습니다. 프레임워크와 설정에 따라 검사 경계는 달라지며, 모든 필수 검사를 통과해 `AuthenticationManager`가 인증 완료 결과를 반환한 뒤에야 인증 성공 처리자가 이를 `SecurityContext`에 반영합니다.

### 인증과 인가는 다른 질문이다

```text
인증: 이 요청 주체가 회원 42인가?
인가: 회원 42가 주문 900을 취소할 수 있는가?
```

로그인에 성공해도 관리자 엔드포인트나 다른 사용자의 주문에 자동 접근할 수 있는 것은 아닙니다.

### 실패 응답은 계정 존재 여부 탐색도 고려한다

“이 이메일은 존재하지 않습니다”와 “비밀번호가 틀렸습니다”를 로그인 응답에서 구분하면 공격자가 가입된 계정을 알아낼 수 있습니다. 외부에는 일관된 오류를 보여 주고, 내부에는 진단에 필요한 정보만 접근을 제한해 남길 수 있습니다.

### MFA도 인증 단계의 강도를 높이는 방법이다

비밀번호가 탈취돼도 추가 인증 요소를 요구하면 공격 난이도를 높일 수 있습니다. 다만 다중 요소 인증(MFA)도 리소스별 인가를 대신하지는 않습니다.

Authentication의 결과는 “누구인지 확인된 주체”이지 **그 주체가 무엇이든 할 수 있다는 허가증**이 아닙니다.
