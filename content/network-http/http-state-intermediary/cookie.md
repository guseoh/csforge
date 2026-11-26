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
  - url: "https://www.rfc-editor.org/rfc/rfc6265.html"
    title: "RFC 6265: HTTP State Management Mechanism"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "정식 발행된 2011년 Cookie/Set-Cookie 기본 명세다. SameSite는 이후 확장으로 별도 확인한다."
    displayOrder: 1
    relationNote: "RFC 6265의 Cookie/Set-Cookie 교환·저장 모델을 먼저 읽는다. SameSite는 2011년 본문에 없으므로 두 번째 초안에서 확인한다."
  - url: "https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html"
    title: "HTTPWG RFC 6265bis: Cookies (Internet-Draft, 미발행)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "SameSite 등 최신 쿠키 동작을 다루지만 2026-10-17 현재 발행 전의 변경 가능한 초안이다."
    displayOrder: 2
    relationNote: "RFC 6265bis 초안의 4.2 Cookie 헤더와 5.7 저장·5.8 반환 동작을 비교한다."
---
# Cookie로 상태 이어가기

HTTP는 요청 사이의 애플리케이션 상태를 자동으로 유지하지 않습니다. 서버는 Set-Cookie 응답 필드로 사용자 에이전트에 값을 저장하도록 요청할 수 있습니다. 이후 전송 조건을 충족하는 요청에서 사용자 에이전트가 Cookie 필드에 이름과 값을 포함합니다.

```text
응답: Set-Cookie: sid=example; Path=/; Secure; HttpOnly
다음 요청: Cookie: sid=example
```

sid를 서버 측 세션의 식별자로 사용한다면 애플리케이션은 해당 값으로 세션을 조회할 수 있습니다. 쿠키가 항상 세션 ID인 것은 아니며 서명된 토큰이나 설정값도 담을 수 있습니다.

### 저장 조건과 인증은 별개입니다

쿠키의 수명, 도메인과 경로, Secure, SameSite 등은 사용자 에이전트가 어느 요청에 값을 포함할지 결정하는 조건입니다. Cookie 요청 필드에 이러한 저장 속성이 그대로 전달되는 것은 아닙니다.

서버는 값을 받았다는 사실만으로 신뢰하지 않고 해당 세션 또는 토큰의 유효성, 만료 및 접근 권한을 검증해야 합니다. 쿠키는 상태를 전달하는 수단이지 인증 성공 자체가 아닙니다.
