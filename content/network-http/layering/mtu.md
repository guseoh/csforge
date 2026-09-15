---
kind: concept
contentKey: network-http.core.layering.mtu
topicContentKey: network-http.core.layering
slug: mtu
title: "MTU"
summary: "link MTU가 packet 크기·fragmentation·전송 실패에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1191"
    title: "Path MTU Discovery"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MTU와 packet fragmentation의 경계를 확인한다."
    displayOrder: 1
---
# MTU

MTU(Maximum Transmission Unit)는 하나의 link가 **fragmentation 없이 운반할 수 있는 network-layer packet 크기의 상한**이다. End-to-end path에는 여러 link가 있을 수 있으므로 실제 전송에서는 그 경로에서 사용할 수 있는 가장 작은 MTU가 중요하다.

MTU는 application message의 최대 크기가 아니다. TCP는 큰 byte stream을 여러 segment로 나누어 전송할 수 있고, application message 하나도 여러 packet에 걸쳐 전달될 수 있다.

### Packet이 다음 link의 MTU보다 크면 어떻게 되는가

IPv4에서는 조건에 따라 router가 packet을 fragmentation할 수 있다. 반면 DF(Don't Fragment)가 설정되어 있거나 IPv6처럼 router fragmentation을 사용하지 않는 경우에는 packet을 그대로 전달하지 못하고 송신 측이 더 작은 packet을 사용하도록 오류 정보를 돌려줄 수 있다.

Path MTU Discovery는 이런 feedback을 이용해 end-to-end path에서 사용할 수 있는 packet size를 찾는 방식이다.

### Fragmentation에는 비용이 있다

하나의 원래 packet이 여러 fragment로 나뉘면 receiver가 다시 조립해야 하고, fragment 일부가 유실되면 원래 packet 전체 전달에 영향을 줄 수 있다. 그래서 가능하면 path MTU에 맞는 크기로 보내 fragmentation을 피하는 것이 유리하다.

Tunnel이나 VPN은 추가 header를 붙이기 때문에 실제 payload에 사용할 수 있는 effective MTU를 줄일 수 있다.

MTU의 핵심은 **application message 크기와 별개의 link/network-layer 제한이며, path의 MTU보다 큰 packet은 fragmentation 또는 전달 실패와 PMTUD 같은 추가 처리를 만들 수 있다는 것**이다.
