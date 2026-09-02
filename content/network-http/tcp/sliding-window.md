---
kind: concept
contentKey: network-http.core.tcp.sliding-window
topicContentKey: network-http.core.tcp
slug: sliding-window
title: "TCP Sliding Window"
summary: "ACK 전송 범위 안에서 여러 byte를 전송하는 sequence window와 receive/congestion limit의 관계를 설명한다."
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
  - url: "https://www.rfc-editor.org/rfc/rfc5681"
    title: "TCP Congestion Control"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP congestion과 sending rate 조절을 확인한다."
    displayOrder: 2
---
# TCP Sliding Window

sliding window는 sender가 byte 하나나 segment 하나를 보낼 때마다 ACK를 기다리지 않고 **여러 byte를 outstanding 상태로 유지하면서 sequence space를 전진**할 수 있게 하는 구조다. 누적 ACK가 진행되면 이미 확인된 왼쪽 범위가 빠지고 이후 sequence를 보낼 여지가 생긴다. 따라서 window는 packet 개수보다 byte sequence 범위로 이해하는 편이 정확하다.

### 하나의 임의 window가 receiver와 network를 동시에 보호하는 것이 아니다

실제 sender가 outstanding으로 둘 수 있는 data는 서로 다른 두 제약을 함께 받는다.

```text
rwnd: receiver가 광고한 receive-window limit
cwnd: sender congestion control이 정한 network-side limit

실제 outstanding 전송 한계 ≈ min(rwnd, cwnd)
```

`rwnd`는 receiver가 감당할 수 있는 receive space를 표현해 flow control을 담당하고, `cwnd`는 sender가 network 혼잡 상태에 맞춰 유지하는 congestion-control state다. RFC 5681도 sender가 `cwnd`와 `rwnd` 중 더 작은 제한을 넘겨 새 data를 보내지 않도록 규정한다.

따라서 “sliding window 값을 크게 잡으면 receiver buffer와 network capacity를 모두 넘긴다”처럼 하나의 knob로 설명하면 두 mechanism을 섞게 된다. receiver가 천천히 읽으면 advertised `rwnd`가 sender를 제한하고, path에서 congestion 신호가 나타나면 congestion-control algorithm이 `cwnd`를 조절한다.

### bandwidth-delay product는 활용 가능한 in-flight data와 연결된다

network가 감당할 수 있고 receiver도 충분히 빠른데 usable sending window가 path의 bandwidth-delay product보다 작으면 한 RTT 동안 충분한 data를 in flight로 유지하지 못해 throughput이 제한될 수 있다. 반대로 큰 receiver buffer가 존재한다는 이유만으로 sender가 network에 무제한 data를 내보낼 수 있는 것은 아니며 `cwnd`가 별도로 제한한다.

대용량 Backend response가 느릴 때 application chunking만 보지 말고 socket send/receive buffer, receiver read rate, advertised `rwnd`, congestion-control state를 계층별로 본다. slow client 때문에 producer가 response를 무한히 메모리에 쌓지 않도록 application에도 bounded buffer와 cancellation/backpressure를 연결한다.
