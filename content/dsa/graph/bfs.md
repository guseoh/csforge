---
kind: concept
contentKey: dsa.core.graph.bfs
topicContentKey: dsa.core.graph
slug: bfs
title: "BFS"
summary: "queue와 visited 상태로 layer 순서 탐색을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "vertex, edge, path, connectivity 같은 graph 기본 모델을 확인한다."
    displayOrder: 1
---
# BFS

Breadth-First Search(BFS)는 시작 vertex에서 edge 수 기준으로 가까운 vertex부터 layer 순서로 탐색한다. 이 순서를 만드는 핵심 자료구조가 FIFO queue다.

```text
queue: [A]
A 처리 → B, C 발견
queue: [B, C]
B 처리 → D 발견
queue: [C, D]
```

일반적인 BFS에서는 vertex를 **처음 발견해 queue에 넣는 순간** visited 처리한다. 그래야 여러 vertex가 같은 neighbor를 가리켜도 같은 vertex가 queue에 중복으로 들어가는 일을 막을 수 있다.

Unweighted graph에서는 거리 k인 vertex가 처리될 때 새로 발견하는 neighbor가 거리 k+1이 된다. FIFO 순서 때문에 더 먼 layer가 먼저 처리될 수 없으므로 vertex를 처음 발견했을 때의 distance가 edge 수 기준 최단 거리다.

Parent를 함께 기록하면 target에서 시작점까지 거꾸로 따라가 실제 경로도 복원할 수 있다.

Adjacency list를 사용하면 각 vertex와 edge를 제한된 횟수만 확인하므로 시간은 O(V+E)다. 모든 edge의 비용이 같지 않은 weighted graph에서는 edge 수가 적은 경로가 최소 비용 경로라는 보장이 없으므로 BFS의 shortest-path 성질을 그대로 적용할 수 없다.
