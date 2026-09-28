---
kind: concept
contentKey: dsa.core.graph-path.kruskal
topicContentKey: dsa.core.graph-path
slug: kruskal
title: "크루스칼 알고리즘(Kruskal)"
summary: "가중치 순 간선을 cycle 없이 선택하는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "MST의 cut property, Prim·Kruskal 선택과 구현 비용을 확인한다."
    displayOrder: 1
---
# 크루스칼 알고리즘(Kruskal)

Kruskal은 모든 간선을 가중치 오름차순으로 보고, 현재까지 선택한 forest에서 **서로 다른 연결 요소를 연결하는 간선만** 선택한다.

```text
for edge in sortedEdges:
    if find(edge.u) != find(edge.v):
        select(edge)
        union(edge.u, edge.v)
```

두 endpoint가 이미 같은 연결 요소라면 그 사이에는 선택된 간선만으로 경로가 존재한다. 여기에 새 간선을 추가하면 cycle이 생기므로 건너뛴다. Union-Find는 이 연결 요소 여부를 빠르게 판단한다.

Greedy 선택이 안전한 이유는 cut property로 설명할 수 있다. 현재 서로 다른 연결 요소 사이를 잇는 최소 가중치 간선은 적절한 cut을 가로지르는 safe 간선으로 볼 수 있다.

Connected 그래프에서 `V-1`개의 간선을 선택하면 MST가 완성된다. 간선 정렬 비용이 일반적으로 지배적이어서 시간 복잡도는 O(E log E)로 볼 수 있고, Union-Find의 find/union은 적절한 최적화를 사용하면 분할 상환 cost가 매우 작다.

그래프가 disconnected라면 하나의 MST가 아니라 연결 요소별 minimum spanning forest가 만들어진다. 동일 가중치 간선이 여러 개이면 서로 다른 간선 집합의 MST가 나올 수도 있다.
