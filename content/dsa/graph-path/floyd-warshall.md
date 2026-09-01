---
kind: concept
contentKey: dsa.core.graph-path.floyd-warshall
topicContentKey: dsa.core.graph-path
slug: floyd-warshall
title: "Floyd-Warshall"
summary: "허용 가능한 중간 정점을 단계적으로 늘려 all-pairs shortest path를 계산한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "all-pairs shortest path와 relaxation 관점을 확인한다."
    displayOrder: 1
---
# Floyd-Warshall

### 한 source가 아니라 모든 vertex pair를 계산한다

Floyd-Warshall은 모든 `(i,j)` pair의 shortest path를 한 번에 계산하는 dynamic programming 알고리즘이다. 핵심 state는 단순히 현재 distance가 아니라 **어떤 중간 vertex까지 경로에 허용했는가**다.

초기 `dist[i][j]`는 직접 edge weight를 사용하고, 자기 자신은 0, 직접 edge가 없으면 infinity로 둔다.

```text
dist[i][i] = 0
dist[i][j] = weight(i,j)  // direct edge
dist[i][j] = INF          // no direct edge
```

### k를 거치는 경로를 새 후보로 본다

중간 vertex `k`를 새로 허용한다고 하자. i에서 j로 가는 최단 경로는 두 경우 중 하나다.

- 기존처럼 k를 사용하지 않는 경로
- i → k와 k → j를 이어 k를 사용하는 경로

따라서 recurrence는 다음과 같다.

```text
dist[i][j] = min(
    dist[i][j],
    dist[i][k] + dist[k][j]
)
```

이 갱신을 k=1부터 V까지 반복하면 마지막에는 모든 vertex를 중간점으로 사용할 수 있는 shortest path가 된다.

### 작은 예로 상태 변화를 본다

```text
A -> B = 4
B -> C = 2
A -> C = 10
```

처음 A→C는 10이다. B를 중간 vertex로 허용하면:

```text
dist[A][B] + dist[B][C]
= 4 + 2
= 6
```

기존 10보다 작으므로 A→C는 6으로 갱신된다.

### 시간과 공간 비용

세 중첩 loop를 사용하므로 시간은 `O(V³)`, distance matrix는 `O(V²)` 공간을 사용한다. 따라서 vertex 수가 큰 sparse graph에서 일부 source query만 필요한 경우에는 지나치게 비쌀 수 있다.

반대로 vertex 수가 충분히 작고 모든 pair query가 반복된다면 한 번 계산한 matrix가 유용할 수 있다.

### Negative edge와 negative cycle

Floyd-Warshall은 적절한 조건에서 negative edge를 처리할 수 있지만 negative cycle이 reachable하면 shortest distance가 유한하게 정의되지 않는다.

알고리즘 종료 후 `dist[v][v] < 0`인 vertex가 있다면 자기 자신으로 돌아오는 음수 비용 cycle이 존재한다는 신호다. 다만 어떤 pair가 그 cycle의 영향을 받는지까지 구분하려면 reachability를 추가로 판단해야 한다.

### 알고리즘 선택 기준

All-pairs 결과가 정말 필요한지 먼저 묻는 것이 중요하다. Source 하나에서만 경로가 필요하면 Dijkstra나 Bellman-Ford가 더 적합할 수 있다. Graph가 자주 바뀌는 환경에서 요청마다 `O(V³)`를 다시 수행하는 설계도 피해야 한다.

즉 Floyd-Warshall은 "shortest path 알고리즘 중 하나"가 아니라 **작거나 중간 규모 graph에서 all-pairs distance가 실제 요구일 때 선택하는 DP**다.
