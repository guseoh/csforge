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

TCP connection에서는 앞선 sequence bytes가 유실되면 뒤 bytes가 도착해도 ordered stream으로 전달되지 않는 transport-level HOL이 발생한다. HTTP/2 stream multiplexing은 application HOL을 줄이지만 이 TCP 경계를 공유한다.

QUIC은 stream별 reliable delivery를 유지해 한 stream의 loss가 다른 stream의 delivery를 같은 방식으로 막지 않도록 한다. 그러나 같은 connection의 congestion과 CPU·bandwidth 경쟁은 여전히 공유된다.

### Backend 연결

HTTP version 변경의 latency 이득을 정상 네트워크와 loss·reordering 조건에서 비교한다. request timeout과 connection migration, fallback을 같은 테스트 시나리오에 넣는다.

