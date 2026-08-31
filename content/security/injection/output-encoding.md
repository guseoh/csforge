---
kind: concept
contentKey: security.core.injection.output-encoding
topicContentKey: security.core.injection
slug: output-encoding
title: "Output encoding과 context 경계"
summary: "같은 untrusted 문자열도 HTML body·attribute·URL·JavaScript context마다 parser가 다르게 해석하므로 출력 위치에 맞는 encoding과 safe sink를 사용해야 하는 이유를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Cross Site Scripting Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: HTML/attribute/JavaScript/CSS/URL context별 output encoding 확인
---
# Output encoding과 context 경계

XSS 방어를 위해 “모든 `<`를 `&lt;`로 바꾸자”처럼 하나의 escape 함수만 만들면 다른 parser context에서 실패할 수 있습니다. Browser는 HTML body, attribute, JavaScript, URL을 서로 다른 문법으로 해석합니다.

### 같은 값도 들어가는 위치가 다르다

```html
<!-- HTML text context -->
<div>USER_VALUE</div>

<!-- attribute context -->
<input value="USER_VALUE">

<!-- JavaScript context -->
<script>
const name = 'USER_VALUE';
</script>

<!-- URL context -->
<a href="/search?q=USER_VALUE">...</a>
```

각 위치에서 특별한 의미를 갖는 문자가 다르므로 context-aware encoding이 필요합니다.

### 가능하면 raw string 조립을 줄인다

서버 template engine의 auto-escape, frontend framework의 text interpolation처럼 **값을 data로 넣는 API**를 우선합니다.

```javascript
node.textContent = untrustedValue;
```

반대로 `innerHTML`, string-to-script, dangerous raw HTML API는 “여기서는 정말 HTML code를 받아야 하는가?”를 다시 묻게 하는 sink입니다.

### sanitization과 encoding은 목적이 다르다

사용자가 rich HTML 일부를 입력하도록 허용해야 한다면 모든 tag를 text로 encoding하면 기능 요구를 만족하지 못합니다. 이때는 허용 tag/attribute를 제한하는 sanitizer를 사용할 수 있습니다. Sanitized HTML을 **어떤 context에 삽입하는지**도 여전히 중요합니다.

### API JSON만 반환한다고 XSS와 무관한 것은 아니다

Backend가 JSON을 안전하게 반환해도 frontend가 그 field를 `innerHTML`에 넣으면 DOM XSS가 발생할 수 있습니다. 따라서 data contract에서 “이 field는 raw HTML인가 plain text인가”를 명확히 하고 consumer rendering 방식까지 봐야 합니다.

Output encoding은 문자열을 깨끗하게 만드는 만능 필터가 아니라 **현재 parser context에서 값이 실행 구조로 탈출하지 못하게 data로 유지하는 기법**입니다.
