---
kind: concept
contentKey: network-http.core.http-versions.quic
topicContentKey: network-http.core.http-versions
slug: quic
title: "QUIC 전송 계층"
summary: "UDP 위에서 암호화된 연결(encrypted connection), 신뢰성 있는 스트림(reliable stream), 혼잡 제어(congestion control)를 제공하는 QUIC 전송 프로토콜을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9000"
    title: "QUIC: A UDP-Based Multiplexed and Secure Transport"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "QUIC 연결·스트림·손실 복구와 혼잡 제어의 기본 규칙을 확인한다."
    displayOrder: 1
---
# QUIC 전송 계층

QUIC은 UDP 데이터그램 위에서 동작하지만 기본 UDP 데이터그램 전송에만 머무르지 않는다. QUIC 프로토콜은 연결 상태, 신뢰성 있는 스트림, 손실 복구, 흐름·혼잡 제어와 암호화 핸드셰이크를 제공한다.

HTTP/3가 사용하는 QUIC 연결에는 여러 스트림이 있고, 각 스트림은 자신의 순서 있는 바이트 전달 상태를 가진다. 따라서 한 스트림의 패킷 손실이 다른 스트림의 누락 바이트처럼 직접 전달을 막지 않는다.

```text
UDP 데이터그램
    ↓
QUIC 연결
  ├─ 신뢰성 있는 스트림 A
  ├─ 신뢰성 있는 스트림 B
  └─ 신뢰성 있는 스트림 C
```

QUIC은 TLS 1.3과 결합해 전송 핸드셰이크에서 암호화를 기본 적용한다. 연결 ID(connection ID)를 사용하므로 끝점의 네트워크 주소가 바뀌어도 연결을 동일한 5-tuple 하나에만 묶지 않는 기능을 제공할 수 있다.

그렇다고 스트림마다 별도의 네트워크를 사용하는 것은 아니다. 같은 QUIC 연결의 혼잡 상태와 대역폭은 공유될 수 있다. **QUIC은 UDP 위에 암호화되고 신뢰성 있는 다중 스트림 전송을 구성해 TCP와 다른 스트림·손실 경계를 제공한다.**
