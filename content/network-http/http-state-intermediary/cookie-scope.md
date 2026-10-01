---
kind: concept
contentKey: network-http.core.http-state-intermediary.cookie-scope
topicContentKey: network-http.core.http-state-intermediary
slug: cookie-scope
title: "쿠키의 전송 범위와 SameSite"
summary: "`Domain`·`Path`·`Secure`·`SameSite`가 쿠키를 보낼 호스트·경로·전송 채널·사이트 문맥을 각각 제한하는 방식을 설명한다."
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

사용자 에이전트는 저장된 쿠키를 모든 요청에 붙이지 않는다. 요청의 호스트와 경로, HTTPS 같은 보안 전송 여부, 사이트 문맥을 쿠키 속성과 대조해 해당 요청에 쿠키를 포함할지 판단한다.

`Domain`을 생략하면 설정한 호스트에만 보내는 호스트 전용 쿠키가 된다. 허용된 `Domain`을 지정하면 해당 도메인의 하위 호스트에도 보낼 수 있다. 범위를 넓힐수록 같은 도메인 아래 다른 서비스가 침해됐을 때 영향이 커질 수 있다.

`Path`는 요청 경로를 기준으로 쿠키를 보낼 범위를 제한한다. 하지만 **접근 권한을 나누는 경계는 아니다.** 같은 호스트에서 실행되는 다른 애플리케이션을 보안상 격리하는 용도로 사용하면 안 된다.

`Secure`는 HTTPS 같은 보안 전송을 사용하는 요청에만 쿠키를 보내도록 제한한다. `HttpOnly`는 스크립트 인터페이스를 통한 쿠키 접근을 제한한다. `SameSite`는 동일 사이트 요청인지 교차 사이트 요청인지에 따라 쿠키 전송 조건을 제한한다. 각 속성의 보호 대상은 서로 다르므로 하나가 나머지 역할을 대신하지 않는다.

```text
저장된 쿠키
   ↓ Domain과 Path 확인
   ↓ Secure 조건 확인
   ↓ SameSite 사이트 문맥 확인
조건을 만족하는 요청에 Cookie 필드로 포함
```

일반적인 쿠키 범위에는 포트가 포함되지 않는다. 같은 호스트에서 443과 8443 포트를 쓴다는 이유만으로 쿠키가 서로 다른 보안 경계로 분리되지는 않는다.

따라서 쿠키 전송 범위는 **인증 정보로 사용될 수 있는 값이 어떤 요청에 자동으로 포함되는지를 정하는 규칙**으로 이해해야 한다.
