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

sliding window는 sender가 아직 ACK를 받지 않은 여러 byte를 동시에 보낼 수 있게 한다. ACK가 진행되면 window가 앞으로 이동해 새 bytes를 보낼 수 있고, window 크기는 receiver capacity와 network congestion에 의해 제한된다.

window가 작으면 bandwidth-delay product를 채우지 못하고, 너무 크게 보낼 수 있으면 receiver buffer나 network queue가 넘친다. sequence·ACK·flow control·congestion control이 서로 다른 한계라는 점을 구분한다.

### Backend 연결

대용량 response가 느릴 때 application chunking만 보지 말고 socket send buffer, receiver read rate, congestion window를 함께 본다. backpressure를 무시해 메모리에 response를 무한히 쌓지 않는다.
