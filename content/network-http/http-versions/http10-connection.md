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

HTTP/1.0의 기본적인 request-response 운용은 persistent connection을 기본 전제로 하지 않아 request마다 TCP connection을 열고 닫는 비용이 생길 수 있다. response에 명시적인 length가 없고 body가 허용되는 경우 connection close가 content 끝을 나타내는 framing이 될 수 있어, connection lifecycle과 message boundary가 강하게 연결된다. status와 method에 따라 애초에 body가 없는 응답은 별도로 판단한다.

당시의 Keep-Alive extension이나 명시적인 length는 handshake와 slow-start 반복을 줄일 수 있지만 client·server·proxy가 해당 semantics와 framing을 함께 이해해야 한다. HTTP version 문자열만으로 실제 connection reuse나 close-delimited response를 단정하지 않고 wire headers, framing과 pool metrics를 확인한다.

현대 client가 HTTP/1.1 이상을 사용해도 proxy와 origin 사이 hop마다 version, persistence와 pooling이 다를 수 있다. Backend에서는 connect count와 request count를 같은 지표로 보지 않고, close가 정상 종료인지 framing 신호인지 구분한다.

