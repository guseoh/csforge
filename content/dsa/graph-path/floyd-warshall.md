---
kind: concept
contentKey: dsa.core.graph-path.floyd-warshall
topicContentKey: dsa.core.graph-path
slug: floyd-warshall
title: "플로이드–워셜 알고리즘(Floyd–Warshall)"
summary: "허용하는 중간 정점 집합을 넓혀 모든 정점 쌍의 최단 거리를 계산하는 동적 계획법을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "가중 그래프의 Dijkstra·Bellman–Ford와 최단 경로 조건을 확인한다."
    displayOrder: 1
---
# 플로이드–워셜 알고리즘(Floyd–Warshall)

플로이드–워셜 알고리즘은 **모든 정점 쌍(all-pairs)** 사이의 최단 거리를 계산하는 동적 계획법 알고리즘이다. 핵심 상태는 "현재까지 어떤 정점들을 중간 정점으로 사용할 수 있도록 허용했는가"이다.

초기에는 자기 자신까지의 거리를 0으로 두고, 직접 연결된 두 정점 사이에는 해당 간선의 가중치를 기록한다. 직접 간선이 없는 정점 쌍의 거리는 무한대로 둔다.

새 중간 정점 `k`를 허용할 때 `i`에서 `j`까지의 최단 경로는 기존 경로를 그대로 사용하는 경우와 `i → k → j`처럼 `k`를 거치는 경우 중 더 짧은 쪽이다.

```text
dist[i][j] = min(
    dist[i][j],
    dist[i][k] + dist[k][j]
)
```

모든 정점을 `k`로 차례로 허용하고 나면 어떤 정점도 중간 정점으로 사용할 수 있으므로 `dist[i][j]`에는 각 정점 쌍의 최단 거리가 남는다.

정점이 `V`개라면 세 중첩 반복문을 사용하므로 시간 복잡도는 `O(V³)`, 거리 행렬은 `O(V²)` 공간을 사용한다. 따라서 그래프가 매우 크거나 시작 정점 몇 개에 대한 거리만 필요하다면 비용이 지나치게 클 수 있다.

음수 간선은 처리할 수 있지만 음수 사이클이 있으면 일부 정점 쌍의 최단 거리가 유한하게 정의되지 않을 수 있다. 계산이 끝난 뒤 `dist[v][v] < 0`이라면 `v`에서 출발해 다시 `v`로 돌아오는 음수 비용 경로가 존재하므로 음수 사이클을 판단하는 중요한 신호가 된다.
