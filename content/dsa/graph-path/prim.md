---
kind: concept
contentKey: dsa.core.graph-path.prim
topicContentKey: dsa.core.graph-path
slug: prim
title: "프림 알고리즘(Prim)"
summary: "현재 tree와 frontier를 잇는 최소 간선 선택을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "MST의 컷 속성(cut property), Prim·Kruskal 선택과 구현 비용을 확인한다."
    displayOrder: 1
---
# 프림 알고리즘(Prim)

Prim은 시작 정점 하나에서 출발해 현재 tree에 포함된 정점 집합과 바깥 정점 집합 사이의 **최소 가중치 frontier 간선**를 반복해서 선택한다.

```text
T 내부  |  T 외부
--------+---------
  u ----|---- v
```

간선 `(u,v)`를 선택하면 바깥 정점 v가 tree에 들어오고, v에서 바깥으로 나가는 새 간선이 frontier 후보가 된다. 우선순위 큐를 사용하면 현재 최소 간선을 빠르게 선택할 수 있다.

큐 안에는 시간이 지나면서 양 endpoint가 모두 tree 안에 들어온 stale 간선이 남을 수 있다. 이런 간선은 새 정점을 추가하지 못하고 cycle을 만들 수 있으므로 꺼냈을 때 건너뛴다.

현재 tree와 나머지 정점 집합은 하나의 cut을 만든다. 그 cut을 가로지르는 최소 간선이 safe하다는 cut property가 Prim의 greedy 선택을 정당화한다.

Adjacency list와 binary heap을 사용하면 일반적으로 O(E log V) 정도로 분석할 수 있고, dense 그래프에서 matrix 기반 구현은 O(V²)가 될 수 있다.

Kruskal이 여러 연결 요소를 합치는 forest 관점이라면 Prim은 **하나의 tree를 frontier 방향으로 확장하는 관점**이다. 두 알고리즘 모두 MST를 구하지만 유지하는 상태가 다르다.
