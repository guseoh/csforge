---
kind: concept
contentKey: network-http.core.http-state-intermediary.cookie-scope
topicContentKey: network-http.core.http-state-intermediary
slug: cookie-scope
title: "Cookie Scope"
summary: "Domain·Path·Secure·SameSite가 전송 범위를 제한하는 방식을 설명한다."
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

user agent는 request의 host와 path, scheme, site context를 cookie의 attribute와 비교해 전송 여부를 결정한다. `Domain`이 없으면 보통 설정한 host에만 묶이고, 명시하면 허용된 하위 host까지 넓어질 수 있다. `Path`는 request path가 cookie path의 범위에 맞는지 결정하지만, 같은 host의 다른 애플리케이션이 그 경로를 보안 경계로 삼을 수 있게 만드는 authorization mechanism은 아니다.

`Secure`는 cookie를 secure channel, 일반적으로 HTTPS인 request에만 보내도록 제한한다. 이는 cookie 값의 무결성이나 HTTPS endpoint 자체의 올바른 인증을 혼자 보장하는 flag가 아니다. `SameSite`는 origin이 아니라 site와 request context를 기준으로 cross-site 전송을 제한하며, Strict·Lax·None의 실제 허용 범위와 browser 정책을 확인해야 한다. 현대 user agent에서는 `SameSite=None`에 `Secure`를 요구하는 경우가 많지만 client 정책을 서버의 유일한 security boundary로 삼지 않는다.

cookie는 port별로 분리되는 저장소가 아니므로 같은 host의 다른 port를 별도 보안 영역이라고 가정하면 안 된다. 또한 너무 넓은 Domain은 덜 신뢰하는 sibling subdomain에 session scope를 노출할 수 있고, 오래 사는 cookie는 탈취 시 피해 시간을 늘린다. 가능한 경우 host-only와 최소 Path를 사용하고, 엄격한 host cookie가 필요한 session에는 `__Host-` prefix 규칙을 검토하되 prefix 지원과 server 검증을 함께 확인한다.

### Backend 연결

관리자와 일반 UI가 다른 host/path를 사용하면 cookie 이름·scope·CSRF 정책을 분리하고, Path가 authorization을 대신한다고 가정하지 않는다. local HTTP 개발 환경에서는 `Secure` cookie가 저장·전송되지 않는 정상 동작을 profile 설정이 가리지 않게 하고, production HTTPS와 cross-site 흐름을 별도로 테스트한다.

