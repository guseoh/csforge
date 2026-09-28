---
kind: concept
contentKey: security.core.injection.output-encoding
topicContentKey: security.core.injection
slug: output-encoding
title: "출력 인코딩(output encoding)과 문맥별 보안 경계"
summary: "같은 값도 HTML 본문·속성·URL·JavaScript에서 다르게 해석되므로 출력 위치에 맞는 인코딩과 안전한 API가 필요한 이유를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Cross Site Scripting Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "HTML·속성·JavaScript·CSS·URL 문맥별 출력 인코딩 확인"
---
# 출력 인코딩(output encoding)과 문맥별 보안 경계

XSS를 막기 위해 모든 `<`를 `&lt;`로 바꾸는 함수 하나만 만들면 출력 위치에 따라 방어가 실패할 수 있습니다. 브라우저는 HTML 본문·속성·JavaScript·URL을 각각 다른 문법으로 해석합니다.

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

각 위치에서 특별한 의미를 갖는 문자가 다르므로 문맥별 인코딩이 필요합니다.

### 원문 문자열을 직접 조립하지 않는다

서버 템플릿 엔진의 자동 이스케이프나 프런트엔드 프레임워크의 텍스트 삽입 기능처럼 **값을 데이터로 처리하는 API**를 우선합니다.

```javascript
node.textContent = untrustedValue;
```

`innerHTML`처럼 원문을 HTML 코드로 해석하는 API를 사용한다면 HTML 입력이 정말 필요한지 먼저 확인해야 합니다.

### HTML 정화와 인코딩은 목적이 다르다

사용자가 서식 있는 HTML을 입력해야 한다면 모든 태그를 텍스트로 바꿀 수는 없습니다. 이때는 허용할 태그와 속성을 제한하는 정화 도구를 사용할 수 있습니다. 정화된 HTML도 **어느 출력 문맥에 넣는지** 확인해야 합니다.

### API JSON만 반환한다고 XSS와 무관한 것은 아니다

백엔드가 JSON을 반환해도 프런트엔드가 필드 값을 `innerHTML`에 넣으면 DOM XSS가 발생할 수 있습니다. 값이 원문 HTML인지 일반 텍스트인지 계약을 정하고 화면에 넣는 방식까지 확인해야 합니다.

출력 인코딩은 **값이 현재 출력 문맥에서 코드로 실행되지 않도록 데이터로 유지하는 기법**입니다.
