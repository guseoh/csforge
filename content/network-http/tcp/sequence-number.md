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

TCP sequence number는 packet 번호가 아니라 connection의 byte stream에서 segment payload가 차지하는 sequence space의 위치를 표현한다. receiver는 이 값을 이용해 out-of-order segment를 buffer하고, 연속해서 받은 범위의 다음 expected byte를 ACK로 알린다. SYN과 FIN도 sequence space에서 각각 한 위치를 소비하므로 data payload length만 세는 것으로 충분하지 않다.

sequence number는 packet ID나 HTTP request ID가 아니라 각 TCP connection의 state다. sequence space는 유한해 wraparound가 발생하므로 protocol은 단순한 정수 대소 비교가 아니라 window 안에서의 순서 규칙을 사용한다. retransmitted segment가 이미 받은 범위와 겹쳐도 receiver는 stream 위치와 유효 범위를 확인해 duplicate를 application에 다시 전달하지 않는다.

packet capture에서 sequence를 보고 application message 순서를 직접 재구성하지 않는다. 먼저 양 방향 TCP stream과 retransmission·overlap을 복원한 뒤 HTTP framing, request ID와 application 처리 순서를 별도로 분석한다.
