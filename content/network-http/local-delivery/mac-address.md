---
kind: concept
contentKey: network-http.core.local-delivery.mac-address
topicContentKey: network-http.core.local-delivery
slug: mac-address
title: "MAC Address"
summary: "local link에서 interface를 식별하는 MAC address의 역할을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "local link delivery와 address resolution을 확인한다."
    displayOrder: 1
---
# MAC Address

MAC address는 local link에서 network interface를 식별하는 link-layer address다. Ethernet frame은 같은 broadcast domain 안의 destination MAC을 보고 switch나 interface가 전달 여부를 결정한다.

MAC address는 IP address와 다른 scope와 lifetime을 가진다. routing을 거쳐 다른 network로 넘어가면 최종 application host의 MAC이 처음부터 end-to-end로 유지되는 것이 아니다.

### Backend 연결

container와 VM의 virtual interface, bridge, NAT는 MAC과 IP mapping을 다르게 보이게 한다. packet capture 위치를 기록하지 않으면 어느 link의 주소를 관찰했는지 혼동한다.

