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
    recommendation: "sequence space, duplicate 처리와 out-of-order segment 요구 수준을 확인한다."
    displayOrder: 1
---
# TCP Sequence Number

TCP sequence number는 packet 번호가 아니라 connection의 byte stream에서 segment payload가 차지하는 sequence space의 위치를 표현한다. receiver는 이 값을 이용해 어떤 byte 범위가 도착했는지, 앞에 gap이 있는지, 이미 받은 범위와 겹치는지를 판단하고 연속해서 받은 범위의 다음 expected byte를 ACK로 알린다. SYN과 FIN도 sequence space에서 각각 한 위치를 소비하므로 data payload length만 세는 것으로 충분하지 않다.

### ordered delivery와 out-of-order buffering을 구분한다

TCP가 application에 제공하는 계약은 **순서가 맞는 byte stream**이다. 뒤 sequence의 segment가 먼저 도착했다고 해서 그 bytes를 gap을 건너 application에 먼저 전달해서는 안 된다.

다만 “모든 TCP receiver가 out-of-order segment를 반드시 buffer한다”까지 protocol의 절대 보장으로 만들면 과하다. RFC 9293은 구현이 가능하면 out-of-order segment를 queue하는 것을 `SHOULD`로 요구한다. 구현은 뒤 segment를 보관해 missing range가 채워졌을 때 연속 stream으로 전달할 수 있지만, resource 제약 등에서는 보관하지 않고 sender의 retransmission에 의존할 수도 있다. 중요한 보장은 **application에 gap 뒤 bytes가 순서를 어긴 채 노출되지 않는다는 것**이다.

sequence number는 packet ID나 HTTP request ID가 아니라 각 TCP connection의 state다. sequence space는 유한해 wraparound가 발생하므로 protocol은 단순한 정수 대소 비교가 아니라 window 안에서의 순서 규칙을 사용한다. retransmitted segment가 이미 받은 범위와 겹쳐도 receiver는 stream 위치와 유효 범위를 확인해 duplicate bytes를 application stream에 다시 추가하지 않는다.

packet capture에서 sequence만 보고 application message 순서를 직접 재구성하지 않는다. 먼저 양 방향 TCP stream과 retransmission·overlap을 복원한 뒤 HTTP framing, request ID와 application 처리 순서를 별도로 분석한다.
