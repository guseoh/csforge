---
kind: concept
contentKey: network-http.core.http-message.header-body
topicContentKey: network-http.core.http-message
slug: header-body
title: "Header and Body"
summary: "metadata header와 content body의 parsing·framing 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Header and Body

header fields는 content length·media type·조건·cache·authorization 같은 metadata와 processing control을 표현하고 content/body는 실제 message bytes를 운반한다. receiver는 header syntax와 field semantics를 먼저 해석한 뒤 HTTP version과 framing 규칙으로 content의 시작·끝을 정해야 application serializer가 올바른 bytes를 읽을 수 있다.

HTTP/1.1의 Content-Length와 transfer coding은 message framing에 관여하지만, HTTP/2·HTTP/3의 binary frame은 transport/protocol framing일 뿐 application content의 JSON object boundary와 같은 의미가 아니다. 서로 다른 intermediary가 length와 transfer rule을 다르게 해석하면 request smuggling이 생길 수 있고, body를 JSON으로 parse할 수 있다는 사실도 authentication·size·semantic validation을 통과했다는 뜻은 아니다.

Backend는 multipart boundary, JSON content size·media type과 header line limits를 서버에서 제한한다. body를 모두 memory에 모으지 않고 streaming할 때도 framing이 확정되는 지점, schema validation, cancellation과 downstream transaction 경계를 유지한다.
