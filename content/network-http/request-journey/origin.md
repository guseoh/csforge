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

web origin은 scheme, host, port의 tuple로 resource와 script의 same-origin 관계를 판단하는 기준이다. `http://example.com`과 `https://example.com`은 scheme이 다르고, `https://example.com:8443`은 port가 다르므로 문자열 host가 같아도 다른 origin이다. URL에 port가 생략된 경우에는 scheme의 default port를 적용한 뒤 비교해야 한다.

origin은 DNS가 반환한 IP, TCP connection의 tuple, HTTP Host header와 동일하지 않다. 하나의 origin name이 여러 address로 해석될 수 있고 proxy가 backend로 다른 connection을 만들 수 있기 때문이다. browser의 CORS·storage·cookie 정책도 origin과 domain/path 같은 서로 다른 기준을 사용하므로 보안 비교를 단순 hostname 비교로 구현하지 않는다.

Backend의 redirect URL, CORS allowlist, secure cookie와 CSRF 정책은 사용자가 본 external origin을 기준으로 설계한다. reverse proxy 뒤에서 내부 scheme이나 private host가 외부 origin으로 노출되지 않도록 trusted forwarded header와 허용 origin 목록을 고정한다.

