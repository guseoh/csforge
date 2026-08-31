---
kind: concept
contentKey: network-http.core.http-versions.http10-connection
topicContentKey: network-http.core.http-versions
slug: http10-connection
title: "HTTP/1.0 Connection"
summary: "request별 connection의 비용과 framing을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1945"
    title: "Hypertext Transfer Protocol — HTTP/1.0"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP connection reuse와 version framing을 확인한다."
    displayOrder: 1
---
# HTTP/1.0 Connection

HTTP/1.0의 기본적인 request-response 모델은 request마다 TCP connection을 열고 닫는 비용을 만들 수 있다. body framing과 connection close가 response 끝을 나타내는 경우가 있어 connection lifecycle이 message boundary와 연결된다.

Keep-alive 확장은 handshake와 slow-start 반복을 줄였지만 client와 server가 extension semantics를 맞춰야 한다. version 이름만으로 실제 connection reuse를 가정하지 않고 wire header와 pool metrics를 확인한다.

### Backend 연결

현대 client가 HTTP/1.1 이상을 사용해도 proxy와 origin 사이 hop마다 version과 pooling이 다를 수 있다. connect count와 request count를 같은 지표로 보지 않는다.

