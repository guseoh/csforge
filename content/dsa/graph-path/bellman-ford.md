---
kind: concept
contentKey: dsa.core.graph-path.bellman-ford
topicContentKey: dsa.core.graph-path
slug: bellman-ford
title: "벨먼–포드 알고리즘(Bellman–Ford)"
summary: "모든 간선을 반복해서 완화하는 과정과 도달 가능한 음수 사이클 감지를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "가중 그래프의 Dijkstra·Bellman–Ford와 최단 경로 조건을 확인한다."
    displayOrder: 1
---
# 벨먼–포드 알고리즘(Bellman–Ford)

벨먼–포드 알고리즘은 음수 간선이 있을 수 있는 **단일 시작점 최단 경로(single-source shortest path)** 문제에서 모든 간선을 반복해서 완화한다. 다익스트라 알고리즘처럼 현재 가장 작은 거리 후보를 일찍 확정하지 않고, 뒤늦게 더 짧은 경로가 발견될 가능성을 열어 둔다.

```text
if dist[u] != INF and dist[u] + w < dist[v]:
    dist[v] = dist[u] + w
    parent[v] = u
```

정점을 반복하지 않는 단순 경로는 정점이 `V`개일 때 최대 `V-1`개의 간선을 가진다. 따라서 모든 간선을 최대 `V-1`번 완화하면 시작 정점에서 도달 가능한 단순 최단 경로의 거리 정보가 끝까지 전파될 수 있다.

음수 간선 자체가 최단 경로 계산을 불가능하게 만드는 것은 아니다. 문제는 **시작 정점에서 도달 가능한 음수 사이클(negative cycle)**이다. 이 사이클을 한 번 돌 때마다 경로 비용이 더 작아진다면 반복 횟수를 늘릴수록 비용을 계속 낮출 수 있으므로 유한한 최단 거리가 존재하지 않는다.

`V-1`번의 전체 완화 이후에도 시작 정점에서 도달 가능한 간선에서 거리가 더 줄어든다면 음수 사이클의 영향을 받고 있다는 신호다. 반대로 한 번의 전체 간선 검사에서 아무 값도 갱신되지 않았다면 거리가 이미 안정되었으므로 조기 종료할 수 있다.

벨먼–포드 알고리즘은 다익스트라 알고리즘보다 넓은 가중치 조건을 다루는 대신 더 많은 간선 완화를 수행한다. 따라서 알고리즘을 선택할 때는 음수 간선의 존재 가능성과 도달 가능한 음수 사이클을 어떻게 처리해야 하는지 먼저 확인해야 한다.
