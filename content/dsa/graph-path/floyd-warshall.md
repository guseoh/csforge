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
    recommendation: "weighted shortest path의 relaxation 조건을 확인한다."
    displayOrder: 1
---
# Floyd-Warshall

Floyd-Warshall의 `dist[i][j]`는 처리한 중간 정점 집합을 거쳐 i에서 j로 가는 최소 비용을 나타낸다. 새로운 중간 정점 `k`를 허용할 때 `dist[i][j]`와 `dist[i][k]+dist[k][j]`를 비교하는 DP recurrence를 적용한다.

행렬 갱신은 `O(V³)`이고 `O(V²)` 공간이 필요해 all-pairs 결과가 필요하고 vertex 수가 감당 가능한 경우에 적합하다. 대각선이 음수가 되면 negative cycle 신호가 된다.

### Backend 연결

모든 concept 쌍의 prerequisite 비용이 필요할 때만 사용하고, 단일 사용자 경로에는 더 작은 single-source 알고리즘을 선택한다. matrix 결과는 원본 edge에서 재생성 가능해야 한다.

