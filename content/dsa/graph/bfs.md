---
kind: concept
contentKey: dsa.core.graph.bfs
topicContentKey: dsa.core.graph
slug: bfs
title: "BFS"
summary: "queue와 visited로 distance layer를 순서대로 확장해 unweighted shortest path를 찾는다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "BFS의 queue 기반 탐색과 shortest-path 성질을 확인한다."
    displayOrder: 1
---
# BFS

### 가까운 정점부터 확장한다

Breadth-First Search는 시작점에서 edge 수 기준으로 가까운 정점부터 방문한다. 이를 가능하게 하는 핵심 자료구조가 FIFO queue다. 시작점을 queue에 넣고, 앞에서 하나를 꺼내 그 정점의 아직 발견되지 않은 이웃을 뒤에 넣는다.

```text
start A

queue: [A]
A 처리 → B, C 발견
queue: [B, C]
B 처리 → D 발견
queue: [C, D]
```

A에서 한 edge 떨어진 B와 C가 먼저 처리되고, 두 edge 떨어진 D는 그 뒤에 처리된다. 이 layer 순서가 unweighted graph shortest path의 근거가 된다.

### 처음 발견한 거리가 최단 거리인 이유

시작점의 거리를 0이라고 하자. 거리 `k`인 모든 정점이 queue에서 처리될 때 새로 발견되는 미방문 이웃은 거리 `k+1` 후보다. FIFO queue 때문에 거리 `k+2`의 정점이 먼저 처리될 수 없다.

따라서 어떤 vertex를 처음 발견했을 때 기록한 distance는 edge 수 기준 최단 거리다. 이후 더 늦게 오는 경로는 같은 길이거나 더 길다.

```text
distance[next] = distance[current] + 1
parent[next] = current
```

`parent`를 함께 기록하면 target에서 parent를 거꾸로 따라가 실제 shortest path도 복원할 수 있다.

### visited는 enqueue할 때 표시한다

BFS에서 자주 생기는 버그는 queue에서 꺼낼 때까지 visited 표시를 미루는 것이다. 여러 vertex가 같은 neighbor를 가리키면 그 neighbor가 queue에 여러 번 들어갈 수 있다.

```text
A -> C
B -> C

A 처리: C enqueue
B 처리: C가 아직 visited 아니라고 보고 또 enqueue
```

따라서 일반적인 BFS에서는 **처음 발견해 queue에 넣는 순간 visited 처리**한다. 이 시점에 distance와 parent도 확정한다.

### 시간 복잡도

Adjacency list에서 각 vertex를 한 번 방문하고 각 edge를 제한된 횟수만 확인하므로 `O(V+E)`다. Matrix를 사용하면 각 vertex마다 전체 `V`칸을 훑을 수 있어 `O(V²)`이 된다.

즉 BFS의 구현 비용은 알고리즘뿐 아니라 graph representation에도 영향을 받는다.

### BFS가 shortest path를 보장하지 않는 경우

BFS의 shortest-path 성질은 모든 edge를 같은 비용 1로 보는 unweighted graph 또는 동일 weight graph에 해당한다. Edge마다 비용이 1, 10, 100처럼 다르면 edge 수가 가장 적은 경로가 총 비용이 가장 작은 경로라는 보장이 없다.

Weighted graph에서는 weight 조건에 따라 Dijkstra, Bellman-Ford 같은 다른 알고리즘을 사용해야 한다.

### 실무에서의 경계

Prerequisite graph에서 "두 단계 이내 관련 concept"을 찾거나 관계 graph를 depth 제한으로 확장할 때 BFS가 자연스럽다. 다만 외부 입력 graph가 매우 크거나 cycle을 포함할 수 있으므로 visited, 최대 node 수, 최대 depth를 함께 관리해야 한다.

또 동일 distance 안에서 여러 정점의 순서는 adjacency iteration order에 따라 달라질 수 있다. 결과 순서가 API 계약이면 stable key나 display order 같은 tie-breaker를 별도로 정의해야 한다.
