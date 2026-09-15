---
kind: concept
contentKey: network-http.core.ip-routing.ipv4-address
topicContentKey: network-http.core.ip-routing
slug: ipv4-address
title: "IPv4 Address"
summary: "IPv4 address와 network/host portion을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc791"
    title: "Internet Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP address와 packet forwarding의 기본을 확인한다."
    displayOrder: 1
---
# IPv4 Address

IPv4 address는 32-bit 값으로 IP packet의 source와 destination을 식별한다. 다만 address 하나만으로 어느 부분이 network이고 어느 부분이 host인지 결정할 수는 없다. 실제 network 범위는 prefix length 또는 subnet mask와 함께 해석해야 한다.

예를 들어 `192.0.2.10/24`에서 `/24`는 앞의 24bit를 network prefix로 본다는 뜻이다. 같은 prefix 안의 destination은 on-link 후보가 될 수 있고, 다른 prefix의 destination은 routing table을 통해 next hop을 찾아야 한다.

### IP address와 MAC address는 역할이 다르다

IP address는 여러 network를 지나 destination을 찾는 network-layer address다. 실제 local frame을 보낼 때는 현재 next hop의 MAC address가 별도로 필요하다.

```text
IP destination → routing decision → next hop
                              ↓
                     ARP/NDP로 link address 확인
```

IPv4 address의 핵심은 **packet의 network-layer source/destination을 표현하며, 실제 local 여부와 forwarding 판단에는 prefix와 routing state가 함께 필요하다는 것**이다.
