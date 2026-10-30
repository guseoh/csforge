---
kind: concept
contentKey: dsa.core.graph.bfs
topicContentKey: dsa.core.graph
slug: bfs
title: "너비 우선 탐색(BFS)"
summary: "큐와 visited 상태로 layer 순서 탐색을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "무방향 그래프 표현, BFS 최단 경로, DFS와 연결 요소 탐색을 확인한다."
    displayOrder: 1
---
# 너비 우선 탐색(BFS)

Breadth-First Search(BFS)는 시작 정점에서 간선 수 기준으로 가까운 정점부터 layer 순서로 탐색한다. 이 순서를 만드는 핵심 자료구조가 FIFO 큐다.

```text
queue: [A]
A 처리 → B, C 발견
queue: [B, C]
B 처리 → D 발견
queue: [C, D]
```

일반적인 BFS에서는 정점을 **처음 발견해 큐에 넣는 순간** visited 처리한다. 그래야 여러 정점이 같은 neighbor를 가리켜도 같은 정점이 큐에 중복으로 들어가는 일을 막을 수 있다.

Unweighted 그래프에서는 거리 k인 정점이 처리될 때 새로 발견하는 neighbor가 거리 k+1이 된다. FIFO 순서 때문에 더 먼 layer가 먼저 처리될 수 없으므로 정점을 처음 발견했을 때의 distance가 간선 수 기준 최단 거리다.

Parent를 함께 기록하면 대상에서 시작점까지 거꾸로 따라가 실제 경로도 복원할 수 있다.

Adjacency list를 사용하면 각 정점과 간선을 제한된 횟수만 확인하므로 시간은 O(V+E)다. 모든 간선의 비용이 같지 않은 weighted 그래프에서는 간선 수가 적은 경로가 최소 비용 경로라는 보장이 없으므로 BFS의 shortest-path 성질을 그대로 적용할 수 없다.
