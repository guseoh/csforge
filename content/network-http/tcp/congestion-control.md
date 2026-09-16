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

TCP congestion control은 sender가 network path의 혼잡 상태를 고려해 **한 번에 network에 outstanding으로 둘 수 있는 data 양을 조절하는 mechanism**이다. Receiver buffer를 보호하는 flow control과 달리, congestion control은 shared network queue와 link capacity를 과도하게 사용해 congestion collapse가 발생하는 것을 줄이는 데 목적이 있다.

Sender는 congestion window(`cwnd`)라는 state를 유지한다. ACK progress, loss와 congestion signal을 관찰하면서 `cwnd`를 늘리거나 줄이고, 새 data 전송량을 제한한다.

```text
network 상태 양호 → cwnd 증가 가능
loss/congestion 신호 → cwnd 감소
```

### rwnd와 cwnd는 서로 다른 제한이다

`rwnd`는 receiver가 광고하는 receive-buffer capacity이고 `cwnd`는 sender가 network congestion 상태에 따라 관리하는 값이다. 실제 sender가 새 data를 보내는 범위는 두 제한을 모두 만족해야 한다.

```text
usable sending limit ≈ min(rwnd, cwnd)
```

### 세부 algorithm은 구현에 따라 달라질 수 있다

Slow start, congestion avoidance 같은 기본 원리는 표준에 정의되어 있지만 실제 OS는 여러 congestion-control algorithm을 사용할 수 있다. 구체적인 rate 증가/감소 방식은 algorithm마다 다를 수 있으므로 `TCP congestion control = 하나의 고정 공식`으로 외우기보다 목적과 state 경계를 이해해야 한다.

Congestion Control의 핵심은 **receiver가 아니라 network path의 혼잡을 고려해 sender의 in-flight data를 제한하고 조정한다는 것**이다.
