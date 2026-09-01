---
kind: concept
contentKey: network-http.core.layering.link-network-transport-application
topicContentKey: network-http.core.layering
slug: link-network-transport-application
title: "Link, Network, Transport and Application"
summary: "link·network·transport·application 계층의 역할을 비교한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Internet protocol layering의 책임 경계를 확인한다."
    displayOrder: 1
---
# Link, Network, Transport and Application

link 계층은 하나의 local link에서 frame과 link address를 사용해 다음 장비까지 전달한다. network 계층은 IP address와 route를 사용해 서로 다른 network를 가로질러 packet의 다음 hop을 선택한다. transport 계층은 process endpoint를 port로 구분하고 TCP처럼 ordered delivery·retransmission·flow control을 제공하거나 UDP처럼 더 얇은 datagram contract를 제공한다. application 계층은 HTTP·DNS처럼 message syntax와 의미, request/response 또는 query/answer protocol을 정의한다.

이 구분은 `모든 transport가 reliability를 보장한다`는 뜻이 아니다. UDP 위 application이 sequence·ACK·retry를 직접 만들 수도 있고, TCP의 reliable byte stream도 peer application이 해당 request를 처리했거나 business transaction을 commit했다는 사실까지 보장하지 않는다. 각 계층의 address와 state가 바뀌는 지점을 함께 추적해야 한다.

예를 들어 remote HTTP 요청에서는 link가 매 hop의 frame destination을, IP가 최종 destination과 route를, transport가 connection/port와 byte delivery를, HTTP가 method·representation·status를 담당한다. 중간 router는 HTTP를 알 필요가 없고, application은 일반적으로 Ethernet frame을 직접 조립하지 않는다.

API 장애에서 DNS resolution, route/connect, TLS handshake, HTTP status, domain result를 별도 span으로 남긴다. “네트워크 오류” 하나로 기록하면 어느 계층의 재시도와 timeout이 필요한지 판단할 수 없다.

