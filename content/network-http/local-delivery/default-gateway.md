---
kind: concept
contentKey: network-http.core.local-delivery.default-gateway
topicContentKey: network-http.core.local-delivery
slug: default-gateway
title: "Default Gateway"
summary: "외부 prefix packet을 next-hop gateway로 보내는 판단을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Internet protocol layering의 책임 경계를 확인한다."
    displayOrder: 1
---
# Default Gateway

Host가 IP packet을 보낼 때 먼저 routing table을 보고 destination이 **직접 연결된 local prefix인지, 다른 network로 가야 하는지** 판단한다. Destination이 on-link라면 target host 자체가 next hop이 되고, local link에서 그 host의 MAC을 ARP/NDP로 찾는다.

Destination이 local prefix 밖에 있고 더 구체적인 route가 없다면 default route가 가리키는 gateway를 next hop으로 선택한다.

### 최종 destination과 next hop은 다르다

Remote server로 보내는 packet에서도 IP destination은 최종 server 주소를 유지한다. 하지만 현재 Ethernet frame의 destination MAC은 local gateway interface의 MAC이다.

```text
IP destination = remote server
routing decision = default gateway
frame destination = gateway MAC
```

Gateway는 packet을 받은 뒤 자신의 routing table을 이용해 다음 hop을 다시 결정한다.

### Default route는 catch-all route다

Default gateway가 모든 traffic을 무조건 받는 특별한 protocol인 것은 아니다. Routing table에 더 구체적인 prefix route가 있으면 그 route가 우선하고, 일치하는 구체적 route가 없을 때 default route가 사용된다.

핵심은 **host가 local subnet 밖의 destination으로 packet을 보낼 때 default route가 next-hop router를 제공하며, 최종 IP destination과 현재 link의 gateway MAC은 서로 다른 경계라는 것**이다.
