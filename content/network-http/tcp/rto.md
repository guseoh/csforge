---
kind: concept
contentKey: network-http.core.tcp.rto
topicContentKey: network-http.core.tcp
slug: rto
title: "Retransmission Timeout"
summary: "RTT 추정과 timeout이 늦은 ACK·loss를 구분하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6298"
    title: "Computing TCP's Retransmission Timer"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP timeout과 retransmission 판단을 확인한다."
    displayOrder: 1
---
# Retransmission Timeout

RTO(Retransmission Timeout)는 TCP sender가 보낸 data에 대한 ACK를 얼마 동안 기다린 뒤 **retransmission이 필요하다고 판단할지 정하는 timer**다. 너무 짧으면 단순히 늦게 도착 중인 data를 loss로 오인해 불필요한 retransmission을 만들고, 너무 길면 실제 loss 복구가 늦어진다.

### RTO는 관측한 RTT와 변동성을 반영한다

TCP는 round-trip time sample을 바탕으로 smoothed RTT(SRTT)와 RTT variation(RTTVAR)을 유지하고, 이를 사용해 RTO를 계산한다. 경로의 RTT가 항상 같은 값이 아니므로 평균만 보는 대신 변동성에 대한 여유도 함께 둔다.

```text
RTT samples
   ↓
SRTT + RTTVAR 추정
   ↓
RTO 계산
   ↓
ACK가 RTO 안에 없으면 retransmission
```

Repeated RTO expiration에서는 timeout을 backoff해 같은 혼잡·손실 상태에 지나치게 공격적으로 retransmission하지 않도록 한다.

### RTO와 application timeout은 다르다

RTO는 TCP transport가 data retransmission 시점을 결정하는 timer다. HTTP client의 request timeout이나 사용자 deadline은 application이 기다릴 수 있는 시간을 정하는 별도 계약이다. Application timeout이 TCP RTO보다 먼저 끝날 수도 있다.

RTO의 핵심은 **실제 RTT와 그 변동성을 바탕으로 premature retransmission과 지나치게 느린 loss recovery 사이의 균형을 잡는 transport timer**라는 것이다.
