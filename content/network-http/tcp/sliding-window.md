---
kind: concept
contentKey: network-http.core.tcp.sliding-window
topicContentKey: network-http.core.tcp
slug: sliding-window
title: "TCP Sliding Window"
summary: "ACK 전 여러 byte를 전송하는 sequence window를 설명한다."
level: 2
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

TCP는 byte 하나나 segment 하나를 보낼 때마다 ACK를 기다리는 stop-and-wait 방식이 아니라, 일정한 sequence 범위의 data를 **ACK 전에 여러 개 outstanding 상태로 유지**할 수 있다. ACK가 진행되면 확인된 왼쪽 범위가 빠지고 새로운 sequence 범위를 보낼 수 있게 되는데, 이를 sliding window 관점으로 이해할 수 있다.

```text
sequence space
[ ACKed ][ outstanding ][ send 가능 ][ 아직 보낼 수 없음 ]
          ↑ ACK 진행
window가 오른쪽으로 이동
```

### Window는 byte sequence 범위다

TCP window는 단순한 packet 개수가 아니라 byte sequence 범위를 기준으로 한다. Segment 크기가 달라도 어떤 bytes가 이미 ACK되었고 어떤 bytes가 아직 outstanding인지 sequence number로 추적한다.

### 실제 전송 가능 범위에는 여러 제약이 있다

Sender가 새 data를 얼마나 outstanding 상태로 둘 수 있는지는 receiver가 광고한 receive window(`rwnd`)와 sender의 congestion-control state(`cwnd`) 같은 제한을 함께 받는다. 일반적으로 sender는 이 둘 중 더 작은 범위를 넘겨 새 data를 보내지 않는다.

Sliding Window의 핵심은 **ACK를 기다리는 동안에도 여러 byte를 pipeline 형태로 전송하고, ACK progress에 맞춰 사용할 수 있는 sequence 범위를 앞으로 이동시키는 것**이다.
