---
kind: concept
contentKey: dsa.core.graph-path.dijkstra
topicContentKey: dsa.core.graph-path
slug: dijkstra
title: "Dijkstra"
summary: "최소 tentative distance를 확정하고 relaxation한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "weighted shortest path의 relaxation 조건을 확인한다."
    displayOrder: 1
---
# Dijkstra

Dijkstra는 아직 확정되지 않은 vertex 중 tentative distance가 가장 작은 것을 확정하고, 그 vertex에서 나가는 edge를 relaxation한다. 모든 edge weight가 음이 아니면 확정된 거리는 이후 더 짧아지지 않는 invariant를 갖는다. 이 조건 때문에 현재 최솟값을 global optimum의 일부로 확정할 수 있다.

음수 edge가 있으면 이미 큰 값처럼 보인 경로가 뒤의 음수 edge를 거쳐 더 짧아질 수 있어 확정 invariant가 깨진다. 따라서 음수 비용이 허용되는 graph에는 Bellman-Ford처럼 다른 알고리즘을 선택하고, 음수 cycle이 shortest path를 정의할 수 없게 만드는지도 확인한다.

priority queue를 사용하면 최소 후보를 효율적으로 선택할 수 있고, 오래된 entry는 현재 distance와 비교해 버릴 수 있다. parent를 갱신할 때 distance와 함께 일관되게 바꿔야 경로 복원이 맞다. 콘텐츠 이동 비용처럼 도메인 값으로 edge를 만들 때는 음수 보상이나 환불을 거리로 표현해도 되는지 먼저 정의한다.
