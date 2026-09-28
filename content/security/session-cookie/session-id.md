---
kind: concept
contentKey: security.core.session-cookie.session-id
topicContentKey: security.core.session-cookie
slug: session-id
title: "세션 ID가 브라우저와 서버 상태를 연결하는 방식"
summary: "브라우저의 세션 ID로 서버가 인증 상태를 찾는 흐름과 세션 ID를 탈취한 사람이 로그인 상태를 재사용할 수 있는 이유를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html"
    title: "Spring Security Reference: Session Management"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "서블릿 세션과 Spring Security 인증 정보의 저장 흐름 확인"
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Session Management"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "세션 식별자의 예측 난이도·수명주기·쿠키 전송 보안 확인"
---
# 세션 ID가 브라우저와 서버 상태를 연결하는 방식

세션 기반 인증에서는 브라우저가 매 요청에 사용자 정보 전체를 보내는 대신 **서버가 발급한 세션 식별자**를 보냅니다. 서버는 그 값으로 세션 상태를 찾고, 저장된 인증 정보를 현재 요청의 보안 컨텍스트로 복원합니다.

```text
로그인 성공
브라우저                        서버
   │ 자격 증명                    │
   ├─────────────────────────────►│ 자격 증명 검증
   │                              │ 세션 생성
   │ Set-Cookie: JSESSIONID=S123  │
   │◄─────────────────────────────┤

다음 요청
Cookie: JSESSIONID=S123
   ├─────────────────────────────►│ 세션 조회
   │                              │ 인증 정보 복원
```

쿠키와 세션은 서로 다릅니다. 쿠키는 브라우저가 식별자를 저장하고 전송하는 HTTP 수단이고, 실제 인증 상태는 서버에 있습니다.

### 세션 ID는 의미 없는 값처럼 보여도 자격 증명 역할을 한다

세션 ID는 사용자 ID나 역할을 드러내지 않는 불투명한 값이어야 합니다. 값에 업무 의미가 없더라도 중요한 자격 증명입니다. 서버가 `S123`을 유효한 로그인 세션과 연결한다면 그 값을 가진 요청은 해당 세션을 사용할 수 있기 때문입니다.

```text
피해자 브라우저 ── S123 ──► 서버
공격자         ── S123 ──► 서버

같은 유효한 식별자라면
서버는 같은 세션 상태를 찾습니다.
```

따라서 세션 ID를 탈취하면 비밀번호를 몰라도 로그인 상태를 재사용할 수 있습니다.

### Identifier 보호는 생성과 전송, 수명 전체의 문제다

세션 ID는 예측하기 어려워야 합니다. HTTPS와 `Secure` 쿠키로 전송 중 노출을 줄이고, `HttpOnly`와 `SameSite`로 일부 공격 경로를 제한합니다. 로그인할 때는 세션 고정을 막도록 ID를 교체하고, 로그아웃하거나 만료되면 서버에서 해당 세션을 무효화해야 합니다.

URL 쿼리 매개변수에 세션 ID를 넣으면 브라우저 기록, 로그, Referer 등을 통해 노출될 가능성이 커집니다. 일반적인 웹 세션에서는 쿠키로 식별자를 전달합니다.

### 사용자 신원과 세션 신원은 수명이 다르다

한 사용자가 여러 번 로그인하면 로그인마다 서로 다른 세션을 가질 수 있습니다.

```text
member 42
├─ 세션 A → 만료
├─ 세션 B → 로그아웃
└─ 세션 C → 활성
```

따라서 `누가 요청했는가`를 나타내는 사용자 신원과 `어떤 로그인 상태에서 요청했는가`를 나타내는 세션 식별자는 구분해야 합니다.

세션 ID의 핵심은 **브라우저가 가진 식별자가 서버의 인증 상태를 가리킨다**는 점입니다. 생성, 전송, 교체, 폐기 중 어느 단계에서든 이 값을 잘못 다루면 세션 전체가 위험해집니다.
