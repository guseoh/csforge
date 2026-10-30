---
kind: concept
contentKey: security.core.browser.xss
topicContentKey: security.core.browser
slug: xss
title: "교차 사이트 스크립팅(XSS)이 데이터를 실행 코드로 바꾸는 순간"
summary: "신뢰할 수 없는 값이 HTML·속성·JavaScript·URL에서 코드로 해석되는 XSS 원리와 출력 문맥에 맞는 인코딩·안전한 DOM API를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Cross Site Scripting Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "출력 문맥별 인코딩과 안전한 삽입 API 원칙 확인"
---
# 교차 사이트 스크립팅(XSS)이 데이터를 실행 코드로 바꾸는 순간

XSS는 **데이터로 취급해야 할 값이 브라우저에서 실행 가능한 코드로 해석될 때** 발생합니다. `<script>` 태그만 찾아 막는 것으로는 충분하지 않습니다.

사용자의 별명을 그대로 HTML에 붙인다고 해 봅시다.

```javascript
profile.innerHTML = "<div>" + nickname + "</div>";
```

공격자가 다음 값을 저장하면:

```html
<img src=x onerror="fetch('/api/me').then(...)" />
```

브라우저는 이를 단순한 텍스트가 아니라 요소와 이벤트 핸들러로 해석할 수 있습니다.

### 저장형·반사형·DOM XSS는 값이 도착하는 경로가 다르다

```text
저장형 XSS
공격자 입력 → DB 저장 → 다른 사용자의 페이지 렌더링 → 실행

반사형 XSS
요청 매개변수 → 응답에 즉시 삽입 → 실행

DOM 기반 XSS
클라이언트 측 JavaScript가 URL/DOM 값을 안전하지 않은 출력 지점(innerHTML 등)에 삽입 → 실행
```

공통 원칙은 **신뢰할 수 없는 값을 출력 위치의 문법에 맞게 처리해 코드로 실행되지 않도록 하는 것**입니다.

### 인코딩은 문맥마다 다르다

HTML 본문, 속성, JavaScript 문자열, URL은 문자 해석 규칙이 다릅니다. `replace("<", "&lt;")` 하나로 모든 위치를 보호할 수 없습니다. 템플릿 엔진의 자동 이스케이프를 활용하고 원문 HTML 출력은 필요한 곳에만 제한합니다.

### 안전한 DOM API를 우선한다

```javascript
profile.textContent = nickname;
```

`textContent`처럼 값을 텍스트로 다루는 API를 우선합니다. 서식 있는 HTML 입력이 필요하다면 허용 요소와 속성을 제한하는 검증된 정화 정책이 필요할 수 있습니다.

### HttpOnly와 CSP는 다층 방어다

`HttpOnly`는 스크립트가 쿠키 값을 직접 읽지 못하게 하지만, 실행된 XSS 스크립트는 피해자 사이트에서 API 요청을 보낼 수 있습니다. CSP는 스크립트의 출처와 인라인 실행을 제한하는 추가 방어이며, 안전하지 않은 출력 코드를 고치는 작업도 필요합니다.

XSS를 분석할 때는 **어느 출력 지점에서 데이터가 코드로 해석됐는지** 추적해야 합니다.
