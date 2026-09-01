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

UDP는 connection handshake와 ordered byte stream을 transport에서 제공하지 않으므로, 독립적인 짧은 datagram이나 빠른 첫 전송이 유리한 discovery·telemetry·real-time media에 사용될 수 있다. IPv4 broadcast/IPv6 multicast와 같은 fan-out 요구에도 맞을 수 있고, QUIC처럼 UDP 위에 별도의 reliable·encrypted protocol을 만들 수도 있다. 이때 해당 보장은 raw UDP가 아니라 상위 protocol의 책임이다.

UDP를 선택한다고 latency가 항상 낮아지는 것은 아니다. application이 loss recovery, congestion/rate control, security, NAT traversal, reordering과 server fan-out을 추가하면 handshake를 아낀 비용보다 상위 protocol 비용이 커질 수 있다. end-to-end latency, loss tolerance, bandwidth fairness와 운영 복잡성을 TCP·QUIC·다른 transport와 같은 조건에서 비교한다.

Backend의 실시간 progress는 일부 최신 값 손실과 stale sample 폐기를 허용할 수 있지만 attempt와 answer 저장은 중복·누락을 허용하지 않을 수 있다. 기능별 freshness, durability와 processing contract가 먼저이며, raw UDP 전송 성공을 DB transaction commit이나 사용자에게 보이는 성공으로 기록하지 않는다.

