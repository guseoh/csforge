---
kind: concept
contentKey: network-http.core.http-state-intermediary.cookie-scope
topicContentKey: network-http.core.http-state-intermediary
slug: cookie-scope
title: "쿠키의 전송 범위와 SameSite"
summary: "Domain·Path·Secure·SameSite가 쿠키가 어느 요청에 포함될 수 있는지 제한하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc10025.html"
    title: "Cookies: HTTP State Management Mechanism"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Cookie·Set-Cookie 필드 문법과 사용자 에이전트의 저장·전송 규칙을 확인한다."
    displayOrder: 1
---
# 쿠키의 전송 범위와 SameSite

사용자 에이전트는 저장된 쿠키를 모든 요청에 붙이지 않는다. 요청의 호스트와 경로, 보안 채널 여부, site context를 쿠키 속성과 비교해 **이번 요청에 해당 쿠키를 포함해도 되는지** 판단한다.

`Domain`을 생략하면 쿠키는 설정한 호스트에 묶이는 host-only cookie가 된다. 허용된 `Domain`을 지정하면 그 도메인의 하위 호스트까지 전송 범위가 넓어질 수 있다. 범위를 넓힐수록 같은 도메인 아래의 다른 서비스가 침해됐을 때 영향을 받을 가능성도 커진다.

`Path`는 요청 경로가 어느 범위에 있을 때 쿠키를 보낼지 제한한다. 하지만 이것은 **인가(authorization) 경계가 아니다.** 같은 호스트의 다른 애플리케이션을 보안적으로 완전히 격리하는 기능으로 사용하면 안 된다.

`Secure`는 쿠키를 보안 전송 채널을 사용하는 요청에만 보내도록 제한한다. `HttpOnly`는 스크립트 API에서 쿠키에 접근하는 것을 제한하고, `SameSite`는 cross-site 요청 문맥에서 쿠키 전송 조건을 제한한다. 각 속성은 줄이는 위험이 다르므로 하나를 설정했다고 나머지 역할까지 대신하는 것은 아니다.

```text
저장된 쿠키
   ↓ Domain / Path 확인
   ↓ Secure 조건 확인
   ↓ SameSite 문맥 확인
조건을 만족하는 요청에만 Cookie 헤더로 포함
```

또한 일반적인 쿠키 범위는 포트별로 완전히 분리되지 않는다. 같은 호스트에서 443과 8443을 사용한다고 해서 서로 독립된 쿠키 보안 경계가 되는 것은 아니다.

따라서 쿠키 scope는 단순한 편의 설정이 아니라 **어떤 요청에 인증 자격처럼 사용될 수 있는 상태가 자동으로 포함될 수 있는지 정하는 전송 범위**로 이해해야 한다.
