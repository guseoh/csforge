---
kind: concept
contentKey: dsa.core.graph-path.kruskal
topicContentKey: dsa.core.graph-path
slug: kruskal
title: "Kruskal"
summary: "가중치 순 edge를 cycle 없이 선택한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "MST의 cut과 cycle 선택 근거를 확인한다."
    displayOrder: 1
---
# Kruskal

Kruskal은 edge를 weight 오름차순으로 보고 두 endpoint가 다른 component일 때만 선택한다. union-find가 같은 component 여부를 알려주므로 선택한 edge가 cycle을 만들지 않는다는 invariant를 유지한다.

모든 edge를 정렬하는 비용이 보통 지배적이며 `O(E log E)`로 분석한다. 끝까지 보았는데도 선택 edge가 `V-1`개보다 작으면 graph가 연결되지 않은 것이다.

### Backend 연결

관계 후보를 비용순으로 취사선택할 때 deterministic tie-breaker를 함께 둔다. 선택 결과는 원래 후보 edge에서 재계산 가능해야 하며, cache가 canonical 관계를 대체하지 않게 한다.

