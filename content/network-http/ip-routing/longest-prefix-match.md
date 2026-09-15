---
kind: concept
contentKey: network-http.core.ip-routing.longest-prefix-match
topicContentKey: network-http.core.ip-routing
slug: longest-prefix-match
title: "Longest Prefix Match"
summary: "여러 route 중 가장 구체적인 destination prefix를 선택하는 이유를 설명한다."
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

Destination address 하나는 여러 routing prefix에 동시에 포함될 수 있다. 이때 routing lookup은 일반적으로 **가장 긴 prefix, 즉 가장 구체적인 route를 우선**한다. 이것을 longest-prefix match라고 한다.

예를 들어 다음 route가 있다고 하자.

```text
0.0.0.0/0       → gateway A
10.0.0.0/8      → gateway B
10.1.2.0/24     → interface C
```

Destination이 `10.1.2.30`이라면 세 prefix에 모두 포함되지만 `/24`가 가장 구체적이므로 `10.1.2.0/24` route가 선택된다.

### "가장 가까운 gateway"를 고르는 규칙이 아니다

Longest-prefix match는 물리적으로 가까운 router나 latency가 가장 낮은 path를 직접 선택하는 알고리즘이 아니다. Destination address와 route prefix가 **몇 bit까지 일치하는지**를 기준으로 specificity를 비교한다.

같은 prefix length의 후보가 여러 개라면 metric이나 policy 같은 추가 규칙이 적용될 수 있다. 따라서 LPM은 route selection의 핵심 기준이지만 모든 우선순위를 혼자 결정하는 것은 아니다.

Longest-prefix match의 핵심은 **넓은 default route보다 destination에 더 구체적으로 맞는 route가 우선한다는 것**이다.
