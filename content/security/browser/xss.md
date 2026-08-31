---
kind: concept
contentKey: security.core.browser.xss
topicContentKey: security.core.browser
slug: xss
title: "XSS가 데이터를 실행 코드로 바꾸는 순간"
summary: "신뢰하지 않은 입력이 HTML·attribute·JavaScript·URL context에서 code로 해석되는 reflected/stored/DOM XSS 원리를 이해하고 context-aware output encoding과 safe DOM API를 적용한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Cross Site Scripting Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: context-specific output encoding과 safe sink 원칙 확인
---
# XSS가 데이터를 실행 코드로 바꾸는 순간

XSS의 핵심은 “사용자가 `<script>` 문자열을 입력했다”가 아니라 **원래 데이터여야 할 값이 browser parser에 의해 실행 가능한 code/context로 해석되는 것**입니다.

사용자 nickname을 그대로 HTML에 붙인다고 해 봅시다.

```javascript
profile.innerHTML = "<div>" + nickname + "</div>";
```

공격자가 다음 값을 저장하면:

```html
<img src=x onerror="fetch('/api/me').then(...)" />
```

browser는 단순 text가 아니라 element와 event handler로 해석할 수 있습니다.

### Stored·Reflected·DOM XSS는 payload가 도착하는 경로가 다르다

```text
Stored XSS
attacker input → DB 저장 → 다른 사용자의 page 렌더링 → 실행

Reflected XSS
request parameter → response에 즉시 삽입 → 실행

DOM XSS
client-side JS가 URL/DOM 값을 unsafe sink(innerHTML 등)에 삽입 → 실행
```

방어의 공통점은 **신뢰하지 않은 데이터를 현재 output context에 맞게 code가 아닌 data로 유지**하는 것입니다.

### encoding은 context마다 다르다

HTML text, HTML attribute, JavaScript string, URL은 escaping 규칙이 다릅니다. 하나의 `replace("<", "&lt;")` 함수로 모든 위치를 보호할 수 없습니다. Template engine의 auto-escaping을 활용하고 raw HTML 출력 기능은 필요한 경우에만 제한적으로 사용합니다.

### safe DOM API를 우선한다

```javascript
profile.textContent = nickname;
```

`textContent`처럼 데이터를 text로 다루는 sink는 `innerHTML`보다 기본적으로 안전한 선택입니다. HTML이 정말 필요한 rich-text 기능이라면 검증된 sanitizer 정책이 필요할 수 있습니다.

### HttpOnly와 CSP는 defense-in-depth다

HttpOnly cookie는 script가 session cookie 값을 직접 읽는 것을 줄이지만 XSS script는 victim origin 권한으로 API request를 보낼 수 있습니다. CSP는 허용할 script source와 inline 실행을 제한해 impact를 줄일 수 있지만 unsafe output handling을 고치지 않고 CSP 하나에 의존하면 안 됩니다.

XSS를 이해하는 핵심은 공격 문자열 목록을 외우는 것이 아니라 **어느 지점에서 데이터와 code의 경계가 무너졌는지**를 추적하는 것입니다.
