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

`Content-Length`는 message content의 octet 수를 표현해 receiver가 고정된 content 경계를 판단하는 데 사용한다. HTTP/1.1 transfer coding은 content를 connection에 전달하는 framing/encoding 방식을 별도로 표현하며, receiver는 method·status·HTTP version·header 조합의 규칙을 적용해 body의 시작과 끝을 결정한다. Content-Length가 있다고 해서 application object의 JSON 길이나 전체 TCP connection 길이를 뜻하는 것은 아니다.

HTTP/1.1에서 conflicting length fields, 잘못된 transfer coding 또는 intermediary와 origin의 서로 다른 precedence는 한 hop이 읽은 request와 다음 hop이 읽은 request를 어긋나게 해 request smuggling 위험을 만든다. HTTP/2·HTTP/3은 자체 binary framing을 사용해 HTTP/1.1 chunked transfer coding을 같은 방식으로 사용하지 않지만, content length의 일관성과 stream termination은 여전히 검증해야 한다. invalid message는 parser 간에 임의로 보정하지 말고 명확히 거부한다.

upload/download gateway는 request body size limit과 streaming parser를 둔다. server가 생성하는 chunked response와 application content length를 임의로 동시에 설정하지 말고, 압축·proxy buffering 뒤의 실제 framing과 client가 관찰하는 length를 별도 테스트한다.

