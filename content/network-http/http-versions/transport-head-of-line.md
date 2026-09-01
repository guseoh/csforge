---
kind: concept
contentKey: network-http.core.http-versions.transport-head-of-line
topicContentKey: network-http.core.http-versions
slug: transport-head-of-line
title: "Transport Head-of-Line"
summary: "TCP-level HOL과 stream-level multiplexing의 차이를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9000"
    title: "QUIC: A UDP-Based Multiplexed and Secure Transport"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "QUIC connection·stream·loss recovery를 확인한다."
    displayOrder: 1
---
# Transport Head-of-Line

TCP connection에서는 앞선 sequence bytes가 유실되면 뒤 bytes가 도착해도 하나의 ordered stream으로 application에 전달되지 않는 transport-level HOL이 발생한다. HTTP/2 stream multiplexing은 response-order/application-level HOL을 줄이지만 모든 frame이 같은 TCP ordered byte stream을 공유하므로 이 경계를 제거하지 않는다.

QUIC은 stream별 reliable delivery state를 유지해 한 stream의 missing data가 다른 stream의 delivery를 같은 방식으로 막지 않도록 한다. 그러나 같은 QUIC connection의 congestion window·connection flow control·CPU·bandwidth 경쟁은 여전히 공유되고, 해당 stream 안의 순서와 HOL은 남는다. 따라서 HTTP/3가 모든 지연을 독립적으로 만드는 것은 아니다.

HTTP version 변경의 latency 이득은 정상 network와 loss·reordering·RTT 조건에서 비교한다. Backend trace에서 packet retransmission, stream wait, connection flow control과 application dependency를 구분하고 request timeout, QUIC migration과 HTTP/2 fallback을 같은 테스트 시나리오에 넣는다.

