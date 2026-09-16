---
kind: concept
contentKey: dsa.core.graph-path.dijkstra
topicContentKey: dsa.core.graph-path
slug: dijkstra
title: "Dijkstra"
summary: "음수가 아닌 edge 조건에서 최소 tentative distance를 확정하고 relaxation하는 과정과 invariant를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "all-pairs shortest path와 relaxation 관점을 확인한다."
    displayOrder: 1
---
# Dijkstra

Dijkstra는 source에서 각 vertex까지 알려진 최단 거리 후보 `dist[]`를 관리하고, 아직 확정되지 않은 vertex 중 tentative distance가 가장 작은 vertex를 하나씩 확정한다.

Neighbor edge `u -> v`를 통해 더 짧은 경로를 찾으면 relaxation으로 distance를 갱신한다.

```text
if dist[u] + weight(u,v) < dist[v]:
    dist[v] = dist[u] + weight(u,v)
    parent[v] = u
```

초기에는 source만 0이고 나머지는 infinity다. Priority queue를 사용하면 현재 최소 tentative distance를 빠르게 선택할 수 있다.

핵심 전제는 **모든 reachable edge weight가 0 이상**이라는 것이다. 이 조건에서는 가장 작은 tentative distance를 가진 vertex를 확정한 뒤, 아직 보지 않은 다른 경로가 그 값을 더 작게 만들 수 없다.

음수 edge가 있으면 나중에 다른 vertex를 거쳐 이미 확정한 distance가 더 작아질 수 있어 이 invariant가 깨진다. 따라서 negative edge를 허용하는 graph에 Dijkstra를 그대로 적용하면 안 된다.

Relaxation 때 parent도 함께 갱신하면 target에서 source까지 shortest path를 복원할 수 있다. 모든 edge weight가 동일한 경우에는 더 단순한 BFS로 같은 목적을 달성할 수 있다.
