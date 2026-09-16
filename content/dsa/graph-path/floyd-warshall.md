---
kind: concept
contentKey: dsa.core.graph-path.floyd-warshall
topicContentKey: dsa.core.graph-path
slug: floyd-warshall
title: "Floyd-Warshall"
summary: "허용한 중간 정점 집합을 늘리는 all-pairs DP를 설명한다."
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

Floyd-Warshall은 모든 vertex pair `(i,j)` 사이의 shortest path를 계산하는 dynamic programming 알고리즘이다. 핵심 state는 **어떤 중간 vertex까지 경로에 사용할 수 있도록 허용했는가**다.

초기에는 직접 edge weight를 distance로 두고, 자기 자신은 0, 직접 edge가 없으면 infinity로 둔다.

새 중간 vertex `k`를 허용할 때 i에서 j로 가는 최단 경로는 기존 경로를 그대로 쓰거나, `i -> k`와 `k -> j`를 이어 k를 거치는 두 경우 중 더 짧은 쪽이다.

```text
dist[i][j] = min(
    dist[i][j],
    dist[i][k] + dist[k][j]
)
```

k를 모든 vertex에 대해 차례로 허용하면 마지막에는 모든 vertex를 중간점으로 사용할 수 있는 shortest path가 된다.

세 중첩 loop를 사용하므로 시간은 O(V³), distance matrix는 O(V²) 공간을 사용한다. 따라서 graph가 매우 크거나 source 몇 개만 필요한 경우에는 부담이 크다.

Negative edge는 처리할 수 있지만 negative cycle이 있다면 일부 shortest distance가 유한하게 정의되지 않는다. 종료 후 `dist[v][v] < 0`은 v를 포함하거나 도달 가능한 음수 cycle의 중요한 신호가 된다.
