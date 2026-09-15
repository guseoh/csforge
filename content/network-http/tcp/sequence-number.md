---
kind: concept
contentKey: network-http.core.tcp.sequence-number
topicContentKey: network-http.core.tcp
slug: sequence-number
title: "TCP Sequence Number"
summary: "byte sequence로 순서·중복·재조립을 추적하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TCP Sequence Number

TCP sequence number는 packet의 일련번호가 아니라 **TCP byte stream에서 data가 놓이는 위치**를 나타낸다. Receiver는 sequence 정보를 이용해 어떤 byte 범위가 도착했는지, 중간에 빠진 범위가 있는지, 이미 받은 data와 겹치는지를 판단한다.

예를 들어 한 segment가 sequence 1000에서 시작해 500 byte의 payload를 가진다면 다음 새 byte는 sequence 1500부터 이어진다.

```text
seq=1000, len=500
bytes: 1000 ... 1499
next byte: 1500
```

### Out-of-order arrival와 ordered delivery

Network에서 뒤쪽 segment가 먼저 도착할 수 있다. TCP 구현은 가능한 경우 out-of-order data를 보관할 수 있지만, 중요한 transport 보장은 **앞의 gap을 건너뛰어 뒤 bytes를 application stream에 먼저 전달하지 않는 것**이다.

Missing range가 채워지면 연속된 byte stream으로 application에 전달할 수 있다. 이미 받은 범위와 겹치는 retransmission이 도착해도 duplicate bytes가 application stream에 다시 추가되지 않도록 sequence space를 사용한다.

### SYN과 FIN도 sequence space를 사용한다

TCP의 SYN과 FIN은 각각 sequence space에서 한 위치를 소비한다. 따라서 sequence 계산을 단순히 payload byte 수만으로 생각하면 handshake와 teardown state를 정확히 설명하기 어렵다.

Sequence Number의 핵심은 **TCP가 packet이 아니라 byte stream의 위치를 번호로 추적해 ordering, duplicate 처리와 retransmission을 가능하게 한다는 것**이다.
