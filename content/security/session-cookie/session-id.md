---
kind: concept
contentKey: security.core.session-cookie.session-id
topicContentKey: security.core.session-cookie
slug: session-id
title: "Session ID가 브라우저와 서버 상태를 연결하는 방식"
summary: "브라우저가 보내는 opaque session identifier로 서버가 authentication/session state를 찾는 흐름과, identifier 탈취가 세션 탈취로 이어지는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html"
    title: "Spring Security Reference: Session Management"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: servlet session과 Spring Security authentication 저장 흐름 확인
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Session Management"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: session identifier entropy·lifecycle·cookie transport 보안 확인
---
# Session ID가 브라우저와 서버 상태를 연결하는 방식

Session 기반 인증에서는 브라우저가 매 요청에 사용자 정보 전체를 보내는 대신 **서버가 발급한 session identifier**를 보낸다. 서버는 그 값을 session state를 찾는 key로 사용하고, 저장된 authentication을 현재 요청의 security context로 복원한다.

```text
로그인 성공
Browser                         Server
   │ credentials                  │
   ├─────────────────────────────►│ credential 검증
   │                              │ session 생성
   │ Set-Cookie: JSESSIONID=S123  │
   │◄─────────────────────────────┤

다음 요청
Cookie: JSESSIONID=S123
   ├─────────────────────────────►│ session lookup
   │                              │ Authentication 복원
```

여기서 cookie와 session은 같은 것이 아니다. Cookie는 브라우저가 identifier를 저장하고 전송하는 HTTP 메커니즘이고, 실제 authentication/session state는 서버 쪽에 존재한다.

### Session ID는 의미 없는 값처럼 보여도 credential 역할을 한다

좋은 session ID는 사용자 ID나 role을 직접 드러내지 않는 opaque 값이어야 한다. 하지만 값 자체에 업무 의미가 없다고 해서 중요하지 않은 것은 아니다. 서버가 `S123`을 유효한 로그인 session과 연결한다면 그 값을 가진 요청은 해당 session을 사용할 수 있기 때문이다.

```text
Victim browser ── S123 ──► server
Attacker       ── S123 ──► server

같은 유효한 identifier라면
서버는 같은 session state를 찾는다.
```

따라서 session ID 탈취는 비밀번호를 다시 알아내지 않아도 인증 상태를 재사용하는 session hijacking으로 이어질 수 있다.

### Identifier 보호는 생성과 전송, 수명 전체의 문제다

Session ID는 충분히 예측하기 어려워야 하고, HTTPS와 `Secure` cookie로 네트워크 노출을 줄이며, `HttpOnly`와 `SameSite` 같은 속성으로 일부 공격 경로를 제한한다. 로그인처럼 privilege가 바뀌는 시점에는 session fixation을 막기 위해 ID를 교체하고, logout이나 만료 시에는 더 이상 유효한 server-side session을 가리키지 못하게 해야 한다.

URL query parameter에 session ID를 넣으면 browser history, log, referrer 같은 여러 경로로 노출될 가능성이 커지므로 일반적인 web session에서는 cookie가 주된 전달 메커니즘으로 사용된다.

### 사용자 identity와 session identity는 수명이 다르다

한 사용자는 같은 identity를 유지하면서 여러 번 로그인할 수 있고 각 로그인은 서로 다른 session을 가질 수 있다.

```text
member 42
├─ session A → expired
├─ session B → logout
└─ session C → active
```

그래서 `누가 요청했는가`를 나타내는 사용자 identity와 `어떤 로그인 상태에서 요청했는가`를 나타내는 session identifier는 구분해야 한다.

Session ID의 핵심은 단순한 임의 문자열이 아니라 **브라우저가 가진 짧은 값이 서버의 인증 상태를 가리키는 보안 경계**라는 점이다. 생성, 전송, 교체, 폐기 중 어느 단계에서든 이 값이 잘못 다뤄지면 session 전체가 위험해질 수 있다.
