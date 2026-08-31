---
kind: concept
contentKey: security.core.session-cookie.session-id
topicContentKey: security.core.session-cookie
slug: session-id
title: "Session ID가 브라우저와 서버 상태를 연결하는 방식"
summary: "브라우저 cookie에는 보통 credential 역할의 opaque session identifier만 두고 실제 인증 상태는 서버 session store에 보관하는 구조와 session ID 탈취가 곧 세션 탈취가 되는 이유를 이해한다."
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

Session 기반 로그인을 “서버가 로그인 정보를 기억한다”라고만 이해하면 cookie가 왜 중요한지 놓칩니다. 일반적인 구조에서는 브라우저가 매 요청에 **opaque session ID**를 보내고, 서버가 그 ID로 session state를 찾아 현재 사용자를 복원합니다.

```text
로그인 성공
Browser                     Server
   │                          │
   │ credentials              │
   ├─────────────────────────►│ verify
   │                          │ create session S123
   │ Set-Cookie: JSESSIONID=S123
   │◄─────────────────────────┤

다음 요청
Cookie: JSESSIONID=S123
   ├─────────────────────────►│ session lookup
   │                          │ principal = member 42
```

브라우저 cookie에 `memberId=42&role=ADMIN` 같은 신뢰 가능한 인증 상태를 평문으로 넣고 서버가 그대로 믿는 모델과 다릅니다. Session ID는 **서버가 가진 상태를 찾는 credential-like handle**입니다.

### Session ID가 탈취되면 비밀번호 없이도 인증 상태를 재사용할 수 있다

공격자가 유효한 session ID를 얻으면 서버 입장에서는 정상 브라우저 요청과 구분하기 어렵습니다.

```text
Victim session ID: S123
      │
      ├─ Victim Browser → S123
      └─ Attacker      → S123

Server lookup 결과는 둘 다 같은 session
```

그래서 ID는 충분한 entropy를 가져야 하고 URL query parameter보다 Secure/HttpOnly/SameSite 같은 cookie 보호와 TLS를 함께 사용합니다.

### Session store는 상태의 source가 된다

단일 서버 memory에 session을 두면 프로세스 restart에 session이 사라지고 여러 instance에서는 어느 instance가 session을 갖는지 문제가 생깁니다. 필요하면 shared session store나 sticky routing을 검토할 수 있지만 **V1/local app이라면 단순 in-memory/session repository가 충분할 수도 있습니다.** 확장 요구 없이 Redis부터 넣을 이유는 없습니다.

### Session ID와 사용자 lifecycle을 분리한다

사용자는 같은 member identity를 유지하지만 logout/login, session expiry에 따라 session ID는 여러 번 바뀔 수 있습니다.

```text
member 42
├─ session A → expired
├─ session B → logout
└─ session C → active
```

Audit에서 member identity와 session identity를 구분하면 “누가 했는가”와 “어떤 로그인 session에서 했는가”를 각각 추적할 수 있습니다.

Session의 핵심은 server state 자체보다 **브라우저가 가진 짧은 식별자가 인증 상태 전체를 가리키므로 그 식별자의 생성·전송·교체·폐기가 security boundary가 된다**는 점입니다.
