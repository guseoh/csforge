---
kind: concept
contentKey: security.core.browser.csrf
topicContentKey: security.core.browser
slug: csrf
title: "CSRF가 자동 credential 전송을 악용하는 방식"
summary: "공격자 사이트가 victim browser에게 state-changing request를 만들게 하고 browser가 session cookie를 자동 첨부하는 특성을 악용하는 CSRF 흐름과 synchronizer token·SameSite 방어 지점을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html"
    title: "Spring Security Reference: CSRF"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: unsafe HTTP method, token 저장/검증과 servlet CSRF protection 확인
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: CSRF Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: synchronizer token, SameSite, origin verification 등 defense 확인
---
# CSRF가 자동 credential 전송을 악용하는 방식

사용자가 `bank.example`에 로그인해 session cookie를 가진 상태에서 `evil.example`을 방문했다고 해 봅시다. 공격자 페이지가 bank의 송금 endpoint로 form을 제출하면 **브라우저가 bank cookie를 자동으로 붙일 수 있다는 점**이 CSRF의 출발점입니다.

```text
Victim visits evil.example
        │
        ▼
<form action="https://bank.example/transfer" method="POST">
        │
        ▼
Browser sends request to bank.example
        │ Cookie: SESSION=valid
        ▼
Server sees authenticated session
```

공격자가 response를 읽을 필요가 없습니다. 송금 state가 바뀌기만 하면 공격은 성공합니다. 그래서 SOP만으로는 충분하지 않습니다.

### CSRF token은 공격자 site가 알 수 없는 값을 요구한다

Server가 session과 연결된 unpredictable token을 발급하고 state-changing request에서 함께 검증합니다.

```text
Browser legitimate form
SESSION=S123
CSRF=T987
        │
        ▼
Server
session S123에 기대하는 token == T987 ?
        ├─ yes → 처리
        └─ no  → 거부
```

공격자 site는 victim cookie를 browser가 자동으로 보내게 할 수 있어도 SOP 때문에 보통 legitimate page의 token 값을 읽을 수 없습니다.

### GET을 state-changing operation으로 만들지 않는다

Browser/캐시/crawler는 GET을 안전한 method로 취급하는 가정을 많이 합니다. `GET /logout-and-delete-account`처럼 상태 변경을 넣으면 CSRF 방어와 HTTP semantics가 모두 약해집니다.

### SameSite는 추가 방어다

`SameSite=Lax/Strict`는 cross-site cookie 전송을 제한해 CSRF risk를 낮출 수 있습니다. 하지만 browser 지원, navigation flow, same-site 공격, 서비스 요구를 고려하면 **token 검증을 무조건 대체한다고 일반화하면 안 됩니다.**

### Authorization header 기반 API는 threat가 다를 수 있다

JavaScript가 memory/local storage의 bearer token을 읽어 명시적으로 Authorization header를 넣어야 하고 browser가 cross-site 요청에 자동 첨부하지 않는 구조라면 전형적인 cookie CSRF 조건은 약해질 수 있습니다. 대신 XSS로 token이 탈취되는 위험 등 다른 threat가 커질 수 있습니다.

CSRF의 핵심은 “다른 사이트 요청” 자체가 아니라 **브라우저가 사용자의 credential을 공격자가 만든 요청에도 자동으로 실어 주는 상황**입니다.
