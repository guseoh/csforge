---
kind: concept
contentKey: network-http.core.tcp.sequence-number
topicContentKey: network-http.core.tcp
slug: sequence-number
title: "TCP Sequence Number"
summary: "byte stream 위치를 나타내는 sequence number가 ordering과 retransmission에 쓰이는 방식을 설명한다."
level: 1
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

TCP sequence number는 stream에서 segment payload가 차지하는 byte 위치를 표현한다. receiver는 이를 이용해 out-of-order segment를 정렬하고 다음에 기대하는 byte를 ACK로 알린다.

sequence number는 packet ID나 HTTP request ID가 아니며 connection별 state다. wraparound와 비교 규칙, retransmitted segment가 이미 수신된 bytes와 겹치는 경우도 protocol이 처리한다.

### Backend 연결

packet capture에서 sequence를 보고 application message 순서를 직접 재구성하지 않는다. TCP stream을 복원한 뒤 HTTP framing과 request ID를 별도로 분석한다.
