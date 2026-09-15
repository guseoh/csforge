---
kind: concept
contentKey: dsa.core.graph-path.minimum-spanning-tree
topicContentKey: dsa.core.graph-path
slug: minimum-spanning-tree
title: "Minimum Spanning Tree"
summary: "모든 vertex를 최소 weight로 연결하는 invariant와 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "Prim의 frontier와 cut 기반 greedy 선택을 확인한다."
    displayOrder: 1
---
# Minimum Spanning Tree

Connected weighted undirected graph에서 spanning tree는 모든 vertex를 포함하면서 cycle이 없는 연결 subgraph다. Vertex가 V개라면 spanning tree는 정확히 `V-1`개의 edge를 가진다.

Minimum Spanning Tree(MST)는 가능한 spanning tree 중 **선택한 edge weight의 총합이 가장 작은 tree**다.

```text
목표: 특정 source에서 target까지의 거리 최소화가 아니라
      전체 vertex를 연결하는 edge 총합 최소화
```

이 점에서 shortest path와 목적이 다르다. MST 안의 두 vertex 사이 path가 원래 graph에서의 shortest path라는 보장은 없다.

MST 알고리즘의 greedy 선택은 cut property와 연결된다. Vertex 집합을 두 부분으로 나누는 cut을 생각했을 때, 그 cut을 가로지르는 적절한 최소 weight edge는 현재 선택을 깨뜨리지 않고 MST에 포함할 수 있는 safe edge가 된다.

Kruskal은 여러 component를 합치는 방식으로, Prim은 하나의 tree를 바깥으로 확장하는 방식으로 이 성질을 사용한다.

같은 weight의 edge가 여러 개라면 MST가 하나만 존재하지 않을 수도 있다. 또 graph가 disconnected라면 모든 vertex를 하나의 spanning tree로 연결할 수 없고, component별 minimum spanning forest를 생각해야 한다.
