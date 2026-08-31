---
kind: concept
contentKey: network-http.core.udp.udp-use-case
topicContentKey: network-http.core.udp
slug: udp-use-case
title: "UDP Use Case"
summary: "지연·broadcast·application control 요구에 따른 UDP 선택을 비교한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
---
# UDP Use Case

UDP는 connection setup과 ordered stream 비용 없이 짧은 datagram을 보낼 수 있어 discovery, telemetry, real-time media, QUIC의 기반에 사용된다. 대신 application이 필요한 reliability·congestion·security를 선택적으로 구현해야 한다.

UDP를 선택한다고 latency가 항상 낮아지는 것은 아니다. loss recovery, NAT traversal, rate control, server fan-out 비용을 포함한 end-to-end 결과를 비교한다.

### Backend 연결

실시간 progress는 일부 최신 값 손실을 허용할 수 있지만 attempt와 answer 저장은 그렇지 않다. 기능별 correctness contract가 transport 선택보다 먼저다.

