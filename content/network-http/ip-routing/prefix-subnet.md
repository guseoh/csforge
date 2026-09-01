---
kind: concept
contentKey: network-http.core.ip-routing.prefix-subnet
topicContentKey: network-http.core.ip-routing
slug: prefix-subnet
title: "Prefix and Subnet"
summary: "network prefix 길이로 local subnet과 host 범위를 나누는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc791"
    title: "Internet Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP address와 packet forwarding의 기본을 확인한다."
    displayOrder: 1
---
# Prefix and Subnet

CIDR prefix length는 IP address에서 network portion으로 취급할 bit 수를 정하고, 나머지 bit가 해당 prefix 안의 host address 공간이 된다. 송신 host는 destination과 자신의 interface prefix를 비교해 on-link 후보인지 판단한다. on-link면 target의 link-layer address를 찾고, 그렇지 않으면 routing table의 next hop으로 packet을 보낸다. prefix 비교가 곧 상대 host가 살아 있다는 뜻은 아니다.

예를 들어 `/24`는 `/16`보다 더 긴 prefix라 더 작은 address block과 더 구체적인 network를 표현한다. 하지만 실제로 할당 가능한 host 수는 network/broadcast 주소, IPv6 여부, cloud/VPC가 예약한 범위를 제외하는 정책에 따라 달라질 수 있다. subnet mask와 CIDR 표기, routing table entry와 security allowlist의 의미도 서로 다른 용도로 사용될 수 있다.

overlapping prefix를 서로 독립된 subnet으로 사용하면 route 선택과 access policy가 모호해지고, 잘못된 interface로 packet을 보내거나 두 tenant를 분리하지 못할 수 있다. 주소 계획에서는 non-overlap을 우선하고, 불가피하면 namespace·VRF·정책 경계를 명시한다.

Backend allowlist와 service bind 범위에 CIDR를 사용할 때는 실제 client source가 NAT나 proxy 뒤에서 어떤 address로 보이는지 확인한다. prefix가 넓다는 이유만으로 같은 신뢰 경계라고 간주하지 않는다.

