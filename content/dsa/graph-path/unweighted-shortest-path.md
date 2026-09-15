---
kind: concept
contentKey: dsa.core.graph-path.unweighted-shortest-path
topicContentKey: dsa.core.graph-path
slug: unweighted-shortest-path
title: "Unweighted Shortest Path"
summary: "BFS layer가 edge 수 기준 최단 거리가 되는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "vertex, edge, path, connectivity 같은 graph 기본 모델을 확인한다."
    displayOrder: 1
---
# Unweighted Shortest Path

Unweighted shortest path는 모든 edge를 같은 비용 1로 보고 **사용한 edge 수가 가장 적은 path**를 찾는 문제다. BFS가 distance layer를 순서대로 확장하기 때문에 이 조건에서 shortest path를 구할 수 있다.

Source의 distance를 0으로 두고, 거리 k인 vertex에서 처음 발견한 neighbor의 distance를 k+1로 기록한다. FIFO queue 때문에 더 먼 layer가 더 가까운 layer보다 먼저 처리될 수 없다.

```text
distance[next] = distance[current] + 1
parent[next] = current
```

처음 발견한 순간의 distance가 최소 edge 수이고, parent를 함께 기록하면 target에서 source까지 거꾸로 따라가 실제 path를 복원할 수 있다.

도달하지 못한 vertex는 source의 distance 0과 구분되는 별도 상태를 가져야 한다.

Edge마다 weight가 다르면 edge 수가 적은 경로와 weight 합이 작은 경로가 달라질 수 있다. 따라서 BFS shortest-path 성질은 **모든 edge cost가 동일하다는 전제**에서만 사용해야 한다.
