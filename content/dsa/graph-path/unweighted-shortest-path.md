---
kind: concept
contentKey: dsa.core.graph-path.unweighted-shortest-path
topicContentKey: dsa.core.graph-path
slug: unweighted-shortest-path
title: "비가중치 최단 경로"
summary: "BFS의 탐색 단계가 간선 수 기준 최단 거리가 되는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "무방향 그래프 표현, BFS 최단 경로, DFS와 연결 요소 탐색을 확인한다."
    displayOrder: 1
---
# 비가중치 최단 경로

비가중치 최단 경로는 모든 간선을 같은 비용 1로 보고 **사용한 간선 수가 가장 적은 경로**를 찾는 문제다. BFS는 시작 정점에서 간선 하나만 거쳐 도달하는 정점, 두 개를 거쳐 도달하는 정점처럼 거리가 가까운 순서대로 탐색하므로 이 조건에서 최단 거리를 구할 수 있다.

시작 정점의 거리를 0으로 두고, 거리 `k`인 정점에서 처음 발견한 이웃 정점의 거리를 `k+1`로 기록한다. FIFO 큐를 사용하므로 더 먼 단계의 정점이 더 가까운 단계의 정점보다 먼저 처리될 수 없다.

```text
distance[next] = distance[current] + 1
parent[next] = current
```

정점을 처음 발견한 순간에 기록한 거리가 시작 정점에서 그 정점까지 필요한 최소 간선 수다. 실제 경로까지 필요하다면 각 정점을 처음 발견했을 때 `parent`를 함께 기록하고, 목적지에서 시작 정점까지 거꾸로 따라가 경로를 복원한다.

도달하지 못한 정점은 거리 0과 구분되는 별도 상태를 사용해야 한다. 그렇지 않으면 시작 정점과 아직 방문하지 못한 정점을 같은 값으로 오해할 수 있다.

간선마다 가중치가 다르면 간선 수가 적은 경로와 가중치 합이 작은 경로가 달라질 수 있다. 따라서 BFS로 최단 경로를 구하는 이 성질은 **모든 간선의 비용이 동일하다는 전제**에서 사용해야 한다.
