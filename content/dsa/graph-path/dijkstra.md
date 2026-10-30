---
kind: concept
contentKey: dsa.core.graph-path.dijkstra
topicContentKey: dsa.core.graph-path
slug: dijkstra
title: "다익스트라 알고리즘(Dijkstra)"
summary: "음수가 아닌 간선 조건에서 가장 짧은 잠정 거리를 확정하고 간선을 완화하는 과정과 불변식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "가중 그래프의 Dijkstra·Bellman–Ford와 최단 경로 조건을 확인한다."
    displayOrder: 1
---
# 다익스트라 알고리즘(Dijkstra)

다익스트라 알고리즘은 시작 정점에서 각 정점까지 현재까지 알려진 최단 거리 후보 `dist[]`를 관리한다. 아직 확정되지 않은 정점 가운데 **잠정 거리(tentative distance)가 가장 작은 정점**을 하나씩 선택해 그 거리를 확정한다.

정점 `u`에서 이웃 정점 `v`로 가는 간선을 확인했을 때 `u`를 거치는 경로가 기존 `dist[v]`보다 짧다면 값을 갱신한다. 이 갱신을 완화(relaxation)라고 한다.

```text
if dist[u] + weight(u,v) < dist[v]:
    dist[v] = dist[u] + weight(u,v)
    parent[v] = u
```

초기에는 시작 정점의 거리만 0이고 나머지 정점의 거리는 무한대로 둔다. 우선순위 큐를 사용하면 아직 확정되지 않은 정점 가운데 잠정 거리가 가장 작은 정점을 효율적으로 선택할 수 있다.

핵심 전제는 **최단 경로 계산에 관여하는 모든 간선의 가중치가 0 이상**이라는 것이다. 가중치가 음수가 아니면 아직 확정되지 않은 경로를 더 이어도 비용이 줄어들 수 없으므로, 가장 작은 잠정 거리를 가진 정점을 꺼냈을 때 그 거리를 안전하게 확정할 수 있다.

음수 간선이 있으면 나중에 다른 정점을 거친 경로가 이미 확정한 거리보다 더 작아질 수 있다. 이 경우 다익스트라 알고리즘의 불변식이 깨지므로 음수 간선을 허용하는 그래프에 그대로 적용하면 안 된다.

완화할 때 `parent`도 함께 갱신하면 목적지에서 시작 정점까지 이전 정점을 거꾸로 따라가 실제 최단 경로를 복원할 수 있다. 모든 간선의 가중치가 동일하다면 더 단순한 BFS로 같은 목적을 달성할 수 있다.
