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
PasswordEncoder.matches(원문, 저장된 해시)
      │
      ├─ 실패 → 인증 실패
      └─ 성공 → 인증 완료된 Authentication
                     │
                     ▼
               SecurityContext
```

서버는 저장된 비밀번호 해시를 복호화하지 않습니다. 사용자가 입력한 비밀번호를 같은 해시 알고리즘으로 계산해 저장된 값과 비교합니다.

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
