---
kind: concept
contentKey: dsa.core.graph-path.minimum-spanning-tree
topicContentKey: dsa.core.graph-path
slug: minimum-spanning-tree
title: "Minimum Spanning Tree"
summary: "모든 vertex를 최소 weight로 연결하는 invariant를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "MST의 cut과 cycle 선택 근거를 확인한다."
    displayOrder: 1
---
# Minimum Spanning Tree

연결된 weighted undirected graph의 spanning tree는 모든 vertex를 cycle 없이 연결한다. 그중 edge weight 합이 최소인 것이 MST이며, tree는 정확히 `V-1`개의 edge를 갖는다.

cut property는 어떤 cut을 가로지르는 최소 edge를 안전하게 선택할 수 있음을, cycle property는 cycle의 최대 edge를 제거해도 최적 가능성이 있음을 말한다. graph가 disconnected면 하나의 tree가 아니라 minimum spanning forest가 된다.

### Backend 연결

학습 콘텐츠를 중복 없이 연결하는 비용 모델에 MST가 맞는지 먼저 확인한다. 방향성이 있거나 경로별 비용을 최소화하려는 문제라면 MST와 shortest path를 혼동하지 않는다.

