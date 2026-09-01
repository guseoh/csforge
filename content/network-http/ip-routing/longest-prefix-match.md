---
kind: concept
contentKey: network-http.core.ip-routing.longest-prefix-match
topicContentKey: network-http.core.ip-routing
slug: longest-prefix-match
title: "Longest Prefix Match"
summary: "여러 route 중 가장 구체적인 destination prefix를 선택하는 규칙을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1812"
    title: "Requirements for IP Version 4 Routers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP routing table과 next hop 선택을 확인한다."
    displayOrder: 1
---
# Longest Prefix Match

하나의 destination이 여러 route prefix에 포함되면 routing lookup은 destination bit와 가장 많이 일치하는, 즉 가장 긴 prefix의 route를 우선한다. `/32` host route는 넓은 `/24`나 `0.0.0.0/0`보다 특정 endpoint에 구체적이고, `/24` route는 default route보다 특정 subnet을 override한다. 이 규칙은 “가장 가까운 gateway”가 아니라 destination 범위의 specificity를 기준으로 한다.

같은 specificity의 후보가 여러 개라면 OS나 routing protocol이 정한 metric, administrative distance, policy rule 등의 추가 우선순위가 적용될 수 있다. 그러므로 LPM만으로 모든 route 선택을 설명할 수는 없지만, 새 구체 route 하나가 전체 network가 아니라 특정 prefix만 다른 interface로 보내는 현상은 이 규칙으로 추적할 수 있다.

route를 선택한 뒤에도 next-hop ARP/NDP, firewall, return path와 connection state가 필요하다. private service와 public endpoint가 같은 hostname으로 resolve되는 환경에서는 DNS answer뿐 아니라 source namespace의 route table과 prefix를 함께 확인한다. application DNS cache만 바꾸어 LPM 결과를 바꿀 수는 없다.

