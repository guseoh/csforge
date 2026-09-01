---
kind: concept
contentKey: network-http.core.tcp.sliding-window
topicContentKey: network-http.core.tcp
slug: sliding-window
title: "TCP Sliding Window"
summary: "ACK 전송 범위 안에서 여러 byte를 전송하는 sequence window를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TCP Sliding Window

sliding window는 sender가 ACK를 하나씩 기다리지 않고 아직 확인되지 않은 여러 byte를 in flight로 보낼 수 있게 하는 sequence 범위다. 왼쪽 경계가 누적 ACK로 전진하면 이전 byte가 확인되고 오른쪽으로 새 전송 공간이 생긴다. window는 packet 개수가 아니라 sequence space의 byte 범위로 생각해야 한다.

실제로 sender가 보낼 수 있는 범위는 receiver가 광고한 receive window와 sender가 추정한 congestion window의 영향을 함께 받으며, 둘 중 더 작은 제한에 막힐 수 있다. window가 path의 bandwidth-delay product보다 작으면 link를 충분히 활용하지 못하고, receiver buffer나 network capacity보다 무리하게 크면 queue loss와 congestion이 증가한다. ACK, flow control과 congestion control은 서로 다른 state다.

대용량 Backend response가 느릴 때 application chunking만 보지 말고 socket send buffer, receiver read rate, advertised window와 congestion window를 함께 본다. slow client 때문에 producer가 response를 무한히 메모리에 쌓지 않도록 bounded buffer와 cancellation을 연결한다.
