---
kind: concept
contentKey: network-http.core.tcp.retransmission
topicContentKey: network-http.core.tcp
slug: retransmission
title: "TCP Retransmission"
summary: "loss나 timeout 뒤 segment를 다시 보내 reliable stream을 유지하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc6298"
    title: "Computing TCP's Retransmission Timer"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RTO timer 만료와 earliest unacknowledged segment retransmission을 확인한다."
    displayOrder: 2
---
# TCP Retransmission

TCP sender는 **retransmission timer(RTO)가 만료**되거나 fast retransmit 같은 loss 신호를 관찰하면 아직 확인되지 않은 sequence 범위의 data를 다시 보낸다. RFC 6298의 RTO timer가 만료된 경우에는 가장 이른 unacknowledged segment를 retransmit하고 RTO를 backoff한다. 이를 receiver의 delayed-ACK timer 같은 의미의 “ACK timer 만료”라고 부르면 서로 다른 timer를 혼동하기 쉽다.

receiver는 sequence와 overlap을 확인해 이미 application stream에 전달한 duplicate bytes를 다시 추가하지 않는다. 따라서 TCP retransmission은 transport-level packet/segment 중복을 ordered byte stream 아래에서 처리하지만 **application request를 정확히 한 번 실행하는 기능은 아니다.**

retransmission은 loss를 transport에서 복구하는 대신 추가 RTT와 bandwidth를 사용하고 congestion control state에도 영향을 줄 수 있다. application timeout이 먼저 만료되면 client가 같은 logical request를 새 connection으로 다시 보낼 수 있으며, 이전 flow의 original request가 server에서 이미 처리됐을 가능성도 남는다. TCP는 endpoint 장애나 장시간 route 단절을 application이 원하는 deadline 안에 무한히 복구해 주는 계약도 아니다.

HTTP request timeout 뒤 재시도를 판단할 때 transport retransmission과 application retry를 분리한다. side effect가 있는 request는 HTTP method semantics와 idempotency key·deduplication 같은 application 계약으로 replay를 보호하고, TCP retransmission 자체를 exactly-once 처리 근거로 사용하지 않는다.
