---
kind: concept
contentKey: network-http.core.local-delivery.default-gateway
topicContentKey: network-http.core.local-delivery
slug: default-gateway
title: "Default Gateway"
summary: "local subnet 밖 목적지의 next hop을 선택하는 default gateway를 설명한다."
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

host가 destination IP를 routing table과 비교했을 때 on-link로 판단하면 해당 destination의 link-layer address를 찾아 직접 frame을 만들 수 있다. 일치하는 더 구체적인 route가 없고 destination이 local prefix 밖에 있으면 default route가 가리키는 gateway를 next hop으로 선택한다. 이때 frame destination MAC은 gateway interface의 MAC이고, IP destination은 최종 host address를 유지한 채 gateway가 다음 route를 결정한다.

default gateway는 모든 traffic을 무조건 보내는 별도 protocol이 아니라 routing table의 catch-all 경로다. specific prefix route가 default보다 우선하며, gateway가 실제로 on-link가 아니거나 ARP/NDP·egress interface·return route가 잘못되면 route entry가 있어도 packet은 전달되지 않는다. gateway 설정이 없으면 local service는 되지만 외부 API·DNS·database 연결이 실패할 수 있다.

Docker container의 default route와 host의 route는 network namespace에 따라 다르다. outbound timeout을 조사할 때 application DNS success, selected route, gateway neighbor resolution, egress firewall과 이후 remote path를 단계별로 분리한다.
