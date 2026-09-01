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

IPv4 host가 packet을 현재 local link로 내보내려면 다음 hop의 IPv4 address와 link-layer MAC을 연결해야 한다. destination이 on-link이면 target host의 MAC을, 다른 subnet이면 routing table이 선택한 gateway interface의 MAC을 ARP로 찾는다. 보통 sender가 local broadcast ARP request를 보내고 해당 address를 가진 node가 reply하며, sender는 결과를 neighbor cache에 일정 기간 보관한다.

ARP는 IP route를 계산하거나 end-to-end connection을 만드는 protocol이 아니다. `IP destination → next hop 결정 → next hop IP의 MAC resolution → Ethernet frame 전송` 중 local link resolution 단계만 담당한다. cache hit면 매 packet마다 request하지 않을 수 있고, entry가 stale/불완전하거나 reply가 오지 않으면 IP address가 올바르더라도 다음 frame을 만들지 못한다. proxy ARP나 virtual gateway처럼 다른 node가 대신 reply하는 환경에서는 관찰되는 owner도 달라질 수 있다.

ARP mapping을 속이는 poisoning은 sender가 attacker MAC으로 frame을 보내도록 만들 수 있어 confidentiality/integrity 문제가 된다. 서비스 연결 장애에서는 DNS가 올바른 IP를 반환했다는 사실과 ARP cache·interface·VLAN reachability를 분리해 확인하고, 보호된 network에서는 inspection/segmentation과 TLS를 함께 고려한다.

