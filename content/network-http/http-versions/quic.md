---
kind: concept
contentKey: network-http.core.http-versions.quic
topicContentKey: network-http.core.http-versions
slug: quic
title: "QUIC"
summary: "UDP 위에서 encrypted connection, reliable streams와 congestion control을 제공하는 QUIC transport를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9000"
    title: "QUIC: A UDP-Based Multiplexed and Secure Transport"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "QUIC connection·stream·loss recovery를 확인한다."
    displayOrder: 1
---
# QUIC

QUIC은 UDP datagram 위에서 동작하지만 raw UDP와 같은 얇은 datagram API에 머물지 않는다. QUIC protocol 자체가 connection state, reliable streams, loss recovery, flow/congestion control과 cryptographic handshake를 제공한다.

HTTP/3가 사용하는 QUIC connection에는 여러 stream이 존재하며, 각 stream은 자신의 ordered byte delivery state를 가진다. 그래서 한 stream의 packet loss가 다른 stream의 missing byte처럼 직접 전달을 막지 않는다.

```text
UDP datagrams
    ↓
QUIC connection
  ├─ reliable stream A
  ├─ reliable stream B
  └─ reliable stream C
```

QUIC은 TLS 1.3과 결합해 transport handshake에서 encryption을 기본적으로 사용한다. 또한 connection ID를 사용하므로 endpoint의 network address가 바뀌는 상황에서도 connection을 같은 5-tuple 하나에만 묶지 않는 기능을 제공할 수 있다.

그렇다고 각 stream이 완전히 독립적인 network를 사용하는 것은 아니다. 같은 QUIC connection의 congestion state와 bandwidth는 공유될 수 있다. **QUIC의 핵심은 UDP 위에 secure, reliable, multiplexed transport를 구성해 TCP와 다른 stream/loss boundary를 제공하는 것**이다.
