---
kind: concept
contentKey: dsa.core.graph-path.dijkstra-non-negative
topicContentKey: dsa.core.graph-path
slug: dijkstra-non-negative
title: "Dijkstra Non-Negative Condition"
summary: "음수 간선에서 Dijkstra의 확정 invariant가 깨지는 이유를 분석한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "weighted shortest path의 relaxation 조건을 확인한다."
    displayOrder: 1
---
# Dijkstra Non-Negative Condition

Dijkstra가 작은 tentative distance를 확정할 수 있는 이유는 아직 거치지 않은 edge를 추가해도 비용이 감소하지 않기 때문이다. 음수 edge가 있으면 현재 큰 distance처럼 보이는 경로가 뒤의 음수 edge로 더 짧아져 이미 확정한 vertex를 다시 바꿀 수 있다.

따라서 negative weight를 허용하는 문제에 Dijkstra를 적용하려면 조건을 증명하거나 edge weight를 변환해야 한다. 변환이 경로 의미와 cycle 조건을 보존하는지도 함께 확인한다.

### Backend 연결

추천 점수나 penalty를 “거리”로 사용할 때 음수 보상과 음수 cycle을 먼저 검사한다. 알고리즘 이름만 보고 선택하지 말고 비용의 domain invariant를 명시한다.

