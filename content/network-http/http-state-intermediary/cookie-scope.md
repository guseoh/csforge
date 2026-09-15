---
kind: concept
contentKey: network-http.core.http-state-intermediary.cookie-scope
topicContentKey: network-http.core.http-state-intermediary
slug: cookie-scope
title: "Cookie Scope"
summary: "Domain·Path·Secure·SameSite가 cookie가 어느 요청에 포함될 수 있는지 제한하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6265"
    title: "HTTP State Management Mechanism"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP cookie state와 전송 scope를 확인한다."
    displayOrder: 1
---
# Cookie Scope

user agent는 저장된 cookie를 모든 요청에 붙이지 않는다. request의 host와 path, secure channel 여부와 site context를 cookie attribute와 비교해 해당 cookie가 이번 요청에 포함될 수 있는지 결정한다.

`Domain`을 생략하면 cookie는 설정한 host에 묶이는 host-only cookie가 된다. 허용된 `Domain`을 지정하면 그 domain의 하위 host까지 전송 범위가 넓어질 수 있다. `Path`는 request path가 어느 범위에 있을 때 cookie를 보낼지 제한한다. 다만 Path는 같은 host의 application 사이를 격리하는 authorization boundary가 아니다.

`Secure`는 cookie를 secure transport를 사용하는 요청에만 보내도록 제한한다. `HttpOnly`는 script API에서 cookie에 접근하는 것을 제한하는 속성이고, `SameSite`는 cross-site context에서 cookie를 전송할 조건을 제한한다. 이 속성들은 서로 다른 위험을 줄이므로 하나를 설정했다고 나머지 역할까지 대신하지 않는다.

```text
저장된 cookie
   ↓ Domain / Path 확인
   ↓ Secure 조건 확인
   ↓ SameSite context 확인
eligible request에만 Cookie로 포함
```

Cookie 저장소는 port별로 완전히 분리되는 모델이 아니다. 따라서 같은 hostname의 다른 port를 독립된 cookie security boundary로 가정하면 안 된다. **Cookie scope는 어떤 HTTP 요청에 credential-like state가 자동 포함될 수 있는지를 정하는 전송 범위**로 이해하는 것이 핵심이다.
