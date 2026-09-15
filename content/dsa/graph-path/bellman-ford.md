---
kind: concept
contentKey: dsa.core.graph-path.bellman-ford
topicContentKey: dsa.core.graph-path
slug: bellman-ford
title: "Bellman-Ford"
summary: "모든 edge relaxation 반복과 negative cycle 감지를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "all-pairs shortest path와 relaxation 관점을 확인한다."
    displayOrder: 1
---
# Bellman-Ford

Bellman-Ford는 음수 edge가 있을 수 있는 single-source shortest path 문제에서 모든 edge를 반복해서 relaxation한다. Dijkstra처럼 현재 최소 후보를 일찍 확정하지 않고, 더 짧은 경로가 뒤늦게 발견될 가능성을 열어 둔다.

```text
if dist[u] != INF and dist[u] + w < dist[v]:
    dist[v] = dist[u] + w
    parent[v] = u
```

Cycle을 반복하지 않는 단순 path는 vertex가 V개일 때 최대 `V-1`개의 edge를 가진다. 따라서 모든 edge를 최대 `V-1`번 relaxation하면 source에서 도달 가능한 finite shortest path가 전파될 수 있다.

음수 edge 자체가 shortest path를 불가능하게 만드는 것은 아니다. 문제는 **source에서 도달 가능한 negative cycle**이다. 그 cycle을 반복할 때마다 path cost를 계속 낮출 수 있으므로 유한한 최솟값이 존재하지 않는다.

`V-1`번 이후에도 어떤 edge에서 distance가 더 줄어든다면 reachable negative cycle이 있다는 신호다. 반대로 한 pass에서 아무 갱신도 없었다면 이미 distance가 안정화되어 조기 종료할 수 있다.

Bellman-Ford는 Dijkstra보다 일반적인 weight 조건을 다루지만 더 많은 relaxation을 수행한다. 알고리즘 선택에서는 음수 edge 가능성과 negative cycle 처리 요구를 먼저 확인해야 한다.
