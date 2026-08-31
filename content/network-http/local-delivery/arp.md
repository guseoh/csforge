---
kind: concept
contentKey: network-http.core.local-delivery.arp
topicContentKey: network-http.core.local-delivery
slug: arp
title: "ARP"
summary: "IPv4 address를 local MAC address로 해석하는 ARP 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "local link delivery와 address resolution을 확인한다."
    displayOrder: 1
---
# ARP

IPv4 host가 같은 local network의 next hop IP로 보내려면 그 IP에 대응하는 MAC을 알아야 한다. ARP request를 broadcast하고 owner가 reply하면 sender는 mapping을 cache해 이후 frame의 destination을 정한다.

ARP cache는 시간이 지나 만료될 수 있고, stale mapping이나 spoofing이 문제를 만든다. 다른 subnet의 host를 찾을 때는 최종 host가 아니라 default gateway의 MAC을 resolve한다.

### Backend 연결

서비스가 IP로 연결되지 않을 때 DNS 성공과 ARP/neighbor resolution을 별도 확인한다. container bridge와 host network에서는 관찰되는 ARP scope가 달라질 수 있다.

