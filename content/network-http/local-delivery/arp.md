---
kind: concept
contentKey: network-http.core.local-delivery.arp
topicContentKey: network-http.core.local-delivery
slug: arp
title: "ARP"
summary: "IPv4 next-hop address를 MAC으로 찾는 request/reply 흐름을 설명한다."
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

IPv4 host가 packet을 local link로 내보내려면 **next hop의 IPv4 address를 link-layer MAC address로 해석**해야 한다. ARP(Address Resolution Protocol)는 이 local address resolution을 담당한다.

Destination이 같은 subnet에 있다면 target host의 IPv4 address에 해당하는 MAC을 찾는다. Destination이 다른 network에 있다면 routing table이 선택한 gateway의 IPv4 address를 next hop으로 삼고, 그 gateway MAC을 ARP로 찾는다.

### Request와 reply

Sender가 필요한 mapping을 모르면 local broadcast로 ARP Request를 보낼 수 있다. 해당 IPv4 address를 가진 node가 ARP Reply로 자신의 MAC을 알려 주고, sender는 결과를 neighbor/ARP cache에 일정 시간 저장해 이후 frame 생성에 재사용한다.

```text
Who has 192.0.2.10?
        ↓ broadcast
192.0.2.10 is at aa:bb:cc:dd:ee:ff
        ↓ reply
ARP cache에 mapping 저장
```

### ARP는 routing protocol이 아니다

ARP는 어느 route를 선택할지 결정하지 않는다. 먼저 routing table이 destination을 기준으로 next hop을 정하고, **그 next hop을 현재 Ethernet link에서 어떻게 보낼지** ARP가 해결한다.

따라서 ARP의 핵심은 `IPv4 destination → route 선택` 이후의 **local next-hop IP-to-MAC resolution**이다.
