---
kind: concept
contentKey: network-http.core.tcp.flow-control
topicContentKey: network-http.core.tcp
slug: flow-control
title: "Flow Control"
summary: "receiver advertised window가 수신 buffer overflow를 막는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# Flow Control

flow control은 receiver가 처리할 수 있는 bytes보다 sender가 빨리 보내 buffer를 넘치게 하지 않도록 advertised receive window로 전송량을 제한한다. 이는 특정 두 endpoint 사이의 수신 capacity에 대한 조절이다.

flow control과 congestion control은 각각 receiver buffer와 network path capacity를 보호한다. receiver가 천천히 읽으면 sender window가 줄어들고 application write가 block되거나 partial result를 낼 수 있다.

### Backend 연결

HTTP response를 생성하는 producer와 socket writer 사이에 bounded buffer를 둔다. slow client 때문에 server memory와 worker가 무한히 점유되지 않도록 cancellation을 전달한다.
