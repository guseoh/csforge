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

목적지 IP가 local subnet에 없으면 host는 routing table의 default route를 사용해 gateway를 next hop으로 선택한다. frame destination은 gateway interface의 MAC이고, IP destination은 최종 host 주소를 유지한 채 router가 다음 경로를 결정한다.

gateway 설정이 없거나 잘못되면 local service는 되지만 외부 API·DNS·database 연결이 실패할 수 있다. 특정 prefix route가 default보다 우선한다는 longest-prefix rule도 함께 확인한다.

### Backend 연결

Docker container의 default route와 host의 route는 다를 수 있다. outbound timeout을 조사할 때 application DNS 성공, local gateway 도달, 이후 route를 단계별로 분리한다.
