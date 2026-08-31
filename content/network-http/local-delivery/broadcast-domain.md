---
kind: concept
contentKey: network-http.core.local-delivery.broadcast-domain
topicContentKey: network-http.core.local-delivery
slug: broadcast-domain
title: "Broadcast Domain"
summary: "broadcast frame이 도달하는 local network 범위를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "local link delivery와 address resolution을 확인한다."
    displayOrder: 1
---
# Broadcast Domain

broadcast domain은 link-layer broadcast가 전달될 수 있는 범위다. ARP request처럼 local address resolution을 위한 broadcast는 router를 넘어 일반적으로 전달되지 않으며 VLAN과 bridge 구성으로 범위가 나뉠 수 있다.

broadcast가 많아지면 모든 interface와 host가 frame을 처리해야 하므로 비용과 noise가 증가한다. subnet prefix와 broadcast domain은 관련 있지만 항상 동일한 경계라고 가정하지 않는다.

### Backend 연결

service discovery와 DNS broadcast는 container network에서 별도 설정이 필요하다. local broadcast에 의존하는 기능은 운영 network와 개발 Docker bridge에서의 reachability를 검증한다.

