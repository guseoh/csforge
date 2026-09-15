---
kind: concept
contentKey: dsa.core.graph-path.kruskal
topicContentKey: dsa.core.graph-path
slug: kruskal
title: "Kruskal"
summary: "가중치 순 edge를 cycle 없이 선택하는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "Prim의 frontier와 cut 기반 greedy 선택을 확인한다."
    displayOrder: 1
---
# Kruskal

Kruskal은 모든 edge를 weight 오름차순으로 보고, 현재까지 선택한 forest에서 **서로 다른 component를 연결하는 edge만** 선택한다.

```text
for edge in sortedEdges:
    if find(edge.u) != find(edge.v):
        select(edge)
        union(edge.u, edge.v)
```

두 endpoint가 이미 같은 component라면 그 사이에는 선택된 edge만으로 path가 존재한다. 여기에 새 edge를 추가하면 cycle이 생기므로 건너뛴다. Union-Find는 이 component 여부를 빠르게 판단한다.

Greedy 선택이 안전한 이유는 cut property로 설명할 수 있다. 현재 서로 다른 component 사이를 잇는 최소 weight edge는 적절한 cut을 가로지르는 safe edge로 볼 수 있다.

Connected graph에서 `V-1`개의 edge를 선택하면 MST가 완성된다. Edge 정렬 비용이 일반적으로 지배적이어서 시간 복잡도는 O(E log E)로 볼 수 있고, Union-Find의 find/union은 적절한 최적화를 사용하면 amortized cost가 매우 작다.

Graph가 disconnected라면 하나의 MST가 아니라 component별 minimum spanning forest가 만들어진다. 동일 weight edge가 여러 개이면 서로 다른 edge 집합의 MST가 나올 수도 있다.
