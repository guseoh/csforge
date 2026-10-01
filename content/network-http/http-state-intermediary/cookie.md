---
kind: concept
contentKey: network-http.core.http-state-intermediary.cookie
topicContentKey: network-http.core.http-state-intermediary
slug: cookie
title: "Cookie로 상태 이어가기"
summary: "HTTP 요청 사이에서 사용자 에이전트가 쿠키를 저장하고 조건에 맞는 다음 요청에 다시 보내는 상태 관리 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc10025.html"
    title: "Cookies: HTTP State Management Mechanism"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Cookie·Set-Cookie 필드 문법과 사용자 에이전트의 저장·전송 규칙을 확인한다."
    displayOrder: 1
---
# Cookie로 상태 이어가기

HTTP 요청은 서로 독립적이어서 이전 요청의 애플리케이션 상태를 자동으로 이어 주지 않는다. 쿠키는 서버가 응답의 `Set-Cookie` 필드로 보낸 이름·값 쌍을 사용자 에이전트가 저장하고, 다음 요청이 전송 조건을 만족할 때 `Cookie` 필드에 그 값을 담아 보내는 상태 관리 방식이다.

서버는 세션 식별자 같은 값을 쿠키에 담아 보내고, 다음 요청에서 돌려받은 값으로 서버 쪽 세션 상태를 찾을 수 있다. 쿠키가 반드시 세션 ID인 것은 아니다. 서명된 토큰이나 설정값을 담을 수도 있으며 값의 의미와 유효성 검사는 애플리케이션이 정한다.

```text
응답: Set-Cookie
        ↓
사용자 에이전트가 저장
        ↓ 조건을 만족하는 다음 요청
요청: Cookie
```

쿠키를 보낼지는 호스트·도메인, 경로, HTTPS 같은 보안 전송 여부, 사이트 문맥, 저장 수명과 범위에 따라 결정된다. 요청의 `Cookie` 필드에는 저장 속성이 다시 들어가는 것이 아니라 선택된 쿠키의 이름과 값이 들어간다.

쿠키 값이 요청에 실려 왔다는 사실만으로 신뢰할 수 있는 사용자 신원 정보이거나 유효한 세션이라고 볼 수 없다. **쿠키는 요청 사이에 상태를 전달하는 수단이며, 값의 신뢰성·유효 기간·권한은 서버가 별도로 확인해야 한다.**
