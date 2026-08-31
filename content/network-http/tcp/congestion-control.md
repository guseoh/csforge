---
kind: concept
contentKey: network-http.core.tcp.congestion-control
topicContentKey: network-http.core.tcp
slug: congestion-control
title: "Congestion Control"
summary: "network capacity 추정에 따라 TCP sending rate를 조절하는 목적을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc5681"
    title: "TCP Congestion Control"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP congestion과 sending rate 조절을 확인한다."
    displayOrder: 1
---
# Congestion Control

congestion control은 여러 flow가 공유하는 network path capacity를 추정해 sender rate를 조절한다. loss, delay, ACK clock을 신호로 congestion window를 늘리거나 줄여 queue overflow와 collapse를 완화한다.

flow control이 충분해도 network가 혼잡하면 전송이 느려질 수 있다. 동시에 많은 retry와 connection을 만들면 application recovery가 congestion을 더 키우는 feedback loop가 된다.

### Backend 연결

timeout 뒤 즉시 모든 request를 재시도하지 않고 exponential backoff와 jitter를 사용한다. autoscaling이 downstream network와 DB capacity를 넘기지 않도록 admission control을 둔다.

