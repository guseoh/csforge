---
kind: concept
contentKey: network-http.core.request-journey.origin
topicContentKey: network-http.core.request-journey
slug: origin
title: "Origin"
summary: "scheme·host·port tuple로 origin을 정의하고 비교한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6454"
    title: "The Web Origin Concept"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "origin과 URL authority의 경계를 확인한다."
    displayOrder: 1
---
# Origin

origin은 scheme, host, port의 tuple로 web security와 resource isolation의 기준이 된다. `http://example`과 `https://example`, 다른 port는 같은 문자열 host를 가져도 다른 origin이다.

origin은 DNS address나 HTTP Host header와 동일하지 않다. proxy와 browser 정책, CORS, cookie scope가 서로 다른 기준을 사용할 수 있으므로 origin 비교를 단순 hostname 비교로 구현하지 않는다.

### Backend 연결

redirect URL, CORS allowlist, secure cookie와 CSRF 정책은 external origin을 기준으로 설계한다. reverse proxy 뒤에서 backend가 내부 scheme을 보지 않도록 forwarded header 신뢰 범위를 고정한다.

