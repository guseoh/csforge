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

congestion control은 receiver buffer가 아니라 sender와 network path 사이의 혼잡 상태를 추정해 sending rate를 조절한다. TCP sender는 ACK clock, loss, delay 같은 관측을 바탕으로 congestion window를 늘리거나 줄이며, 이 값은 아직 확인되지 않은 data의 양을 제한한다. 세부 알고리즘과 신호 해석은 TCP 구현·버전에 따라 달라도 목적은 shared queue의 overflow와 congestion collapse를 완화하는 데 있다.

flow control이 충분해도 여러 flow가 같은 bottleneck을 사용하면 congestion window 때문에 전송이 느려질 수 있다. loss가 application failure인지 transport가 복구할 transient event인지 구분하지 않고 무제한 retry·connection을 만들면, recovery traffic이 같은 path를 더 혼잡하게 만드는 feedback loop가 된다. congestion control은 application-level fairness나 downstream DB capacity까지 자동으로 보장하지 않는다.

Backend는 timeout 직후 모든 request를 동시에 재시도하지 않고 exponential backoff와 jitter, bounded concurrency를 사용한다. autoscaling이나 connection pool 확대도 downstream network와 DB capacity를 넘을 수 있으므로 admission control과 transport metrics를 함께 본다.

