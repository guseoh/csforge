---
kind: concept
contentKey: security.core.browser.csrf
topicContentKey: security.core.browser
slug: csrf
title: "사이트 간 요청 위조(CSRF)가 쿠키 자동 전송을 악용하는 방식"
summary: "공격자 사이트가 브라우저의 세션 쿠키 자동 전송을 이용해 상태 변경 요청을 유도하는 CSRF 흐름과 토큰·SameSite 방어의 적용 지점을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html"
    title: "Spring Security Reference: CSRF"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "안전하지 않은 HTTP 메서드·토큰 저장과 검증·서블릿 CSRF 방어 확인"
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: CSRF Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "동기화 토큰·SameSite·출처 검증 등의 방어 확인"
---
# 사이트 간 요청 위조(CSRF)가 쿠키 자동 전송을 악용하는 방식

사용자가 `bank.example`에 로그인해 세션 쿠키를 가진 상태에서 `evil.example`을 방문했다고 해 봅시다. 여기서는 세션 쿠키가 `SameSite=None; Secure`로 설정되어 교차 사이트 요청에도 전송된다고 가정합니다. 공격자 페이지가 은행의 송금 엔드포인트로 폼을 제출하면 **브라우저가 은행 사이트의 쿠키를 자동으로 붙인다는 점**이 CSRF의 출발점입니다.

```text
피해자가 evil.example 방문
        │
        ▼
HTML 폼: <form action="https://bank.example/transfer" method="POST">
        │
        ▼
브라우저가 bank.example에 요청 전송
        │ Cookie: SESSION=valid
        ▼
서버가 인증된 세션으로 처리
```

공격자가 응답을 읽을 필요가 없습니다. 송금 상태가 바뀌기만 하면 공격은 성공합니다. 그래서 SOP만으로는 충분하지 않습니다.

`SameSite=Lax`나 `Strict`는 이런 교차 사이트 `POST`에서 쿠키 전송을 제한할 수 있습니다. 실제 위험을 판단할 때는 쿠키 속성과 요청 방식까지 함께 확인해야 합니다.

### CSRF 토큰은 공격자가 알 수 없는 값을 요구한다

서버가 세션과 연결된 예측하기 어려운 토큰을 발급하고 상태 변경 요청에서 그 값을 검증합니다.

```text
브라우저의 정상 폼
SESSION=S123
CSRF=T987
        │
        ▼
서버
세션 S123에 기대하는 토큰 == T987 ?
        ├─ 일치 → 처리
        └─ 불일치 → 거부
```

공격자 사이트는 브라우저가 피해자의 쿠키를 자동 전송하게 할 수 있지만, 동일 출처 정책 때문에 보통 정상 페이지의 CSRF 토큰 값은 읽지 못합니다.

### GET을 상태 변경 작업으로 만들지 않는다

브라우저·캐시·크롤러는 GET 요청이 상태를 바꾸지 않는다고 가정합니다. `GET /logout-and-delete-account`처럼 상태 변경을 넣으면 예상치 못한 요청으로 계정이 변경될 수 있습니다.

### SameSite는 추가 방어다

`SameSite=Lax/Strict`는 교차 사이트 쿠키 전송을 제한해 CSRF 위험을 낮춥니다. 그러나 브라우저 동작, 페이지 이동 방식, 같은 사이트 안의 공격 가능성을 고려해야 하므로 **모든 상황에서 CSRF 토큰 검증을 대신한다고 단정할 수 없습니다.**

### Authorization 헤더 기반 API는 위협이 다를 수 있다

브라우저가 자동 첨부하지 않는 토큰을 JavaScript가 `Authorization` 헤더에 넣어 보내는 구조라면 전형적인 쿠키 기반 CSRF 조건은 약해질 수 있습니다. 대신 XSS가 발생했을 때 토큰을 읽을 수 있는지 등 다른 위험을 검토해야 합니다.

CSRF의 핵심은 “다른 사이트 요청” 자체가 아니라 **브라우저가 사용자의 자격 증명을 공격자가 만든 요청에도 자동으로 실어 주는 상황**입니다.
