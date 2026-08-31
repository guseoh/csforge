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

Dijkstra는 아직 확정되지 않은 vertex 중 tentative distance가 가장 작은 것을 확정하고, 그 vertex에서 나가는 edge를 relaxation한다. 모든 edge weight가 음이 아니면 확정된 거리는 이후 더 짧아지지 않는 invariant를 갖는다.

priority queue를 사용하면 최소 후보를 효율적으로 선택할 수 있고, 오래된 entry는 현재 distance와 비교해 버릴 수 있다. parent를 갱신할 때 distance와 함께 일관되게 바꿔야 경로 복원이 맞는다.

### Backend 연결

콘텐츠 이동 비용이 음수가 아닌 경우 사용자별 학습 경로를 계산할 수 있다. 비용 정책 변경은 캐시된 경로를 canonical 결과로 취급하지 않도록 버전과 함께 관리한다.

