---
kind: concept
contentKey: network-http.core.http-message.content-length-transfer
topicContentKey: network-http.core.http-message
slug: content-length-transfer
title: "Content-Length and Transfer"
summary: "message framing과 Content-Length·transfer encoding의 관계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 message framing과 body 경계를 확인한다."
    displayOrder: 1
---
# Content-Length and Transfer

Content-Length는 message content의 octet 수를 framing에 사용하고, transfer coding은 sender가 content를 connection에 전달하는 방식을 설명한다. receiver는 둘의 조합과 HTTP version 규칙을 보고 body가 어디서 끝나는지 판단한다.

신뢰할 수 없는 proxy 조합에서 conflicting length header나 잘못된 transfer coding은 request smuggling 위험을 만든다. intermediary와 origin이 동일한 framing 규칙을 사용하게 하고 invalid message를 명확히 거부한다.

### Backend 연결

upload/download gateway는 request body size limit과 streaming parser를 둔다. server가 생성하는 chunked response와 application content length를 임의로 동시에 설정하지 않는다.

