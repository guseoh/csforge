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

flow control은 receiver가 TCP receive buffer에 수용할 수 있는 양을 advertised receive window로 알리고 sender의 in-flight data를 그 범위 안에 제한하는 mechanism이다. receiver application이 socket을 늦게 읽으면 buffer의 available space가 줄고, sender는 ACK가 진행될 때까지 더 많은 data를 보낼 수 없게 된다. window가 0에 가까워지면 sender가 멈추거나 probe를 통해 회복을 기다릴 수 있다.

이 조절은 특정 receiver의 capacity를 보호하는 것이며, network path 전체의 queue capacity를 추정하는 congestion control과 다르다. flow control window가 충분해도 congestion window가 작을 수 있고, 반대로 path가 여유 있어도 receiver가 천천히 읽으면 sender가 막힌다. API의 `write()`가 언제 block되거나 partial 결과를 반환하는지는 runtime/socket API contract도 함께 봐야 한다.

HTTP response를 생성하는 producer와 socket writer 사이에 bounded buffer를 두고 slow client의 backpressure를 전달한다. 그렇지 않으면 flow control이 worker를 자연스럽게 늦추는 대신 server memory와 task가 무한히 점유될 수 있으므로 cancellation과 connection close를 application lifecycle에 연결한다.
