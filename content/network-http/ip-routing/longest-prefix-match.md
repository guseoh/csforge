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

destination이 여러 route prefix에 포함되면 가장 긴 prefix, 즉 가장 구체적인 route를 선택한다. 예를 들어 특정 subnet route는 더 넓은 default route보다 우선해 별도 gateway로 향할 수 있다.

정확한 bit 범위와 CIDR 경계를 계산해야 하며 route priority나 metric은 같은 specificity 안에서의 선택에 관여할 수 있다. 잘못된 route 하나가 전체 network가 아니라 특정 prefix만 끊는 이유도 이 규칙으로 설명한다.

### Backend 연결

private service와 public endpoint가 같은 hostname으로 resolve될 때 split route와 prefix를 확인한다. application DNS cache만 바꿔 route 문제를 해결할 수 없다는 점을 기억한다.

