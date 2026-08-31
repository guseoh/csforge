---
kind: concept
contentKey: dsa.core.graph.bfs
topicContentKey: dsa.core.graph
slug: bfs
title: "BFS"
summary: "queue와 visited 상태로 layer 순서 탐색을 수행한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "graph의 경로와 연결성 알고리즘을 확인한다."
    displayOrder: 1
---
# BFS

BFS는 시작 vertex를 queue에 넣고, queue에서 꺼낸 vertex의 미방문 이웃을 다음 layer로 넣는다. vertex를 처음 발견한 시점의 거리는 unweighted graph에서 edge 수 기준 최단 거리이며, 발견 즉시 visited로 표시해야 중복 enqueue를 막는다.

탐색은 모든 도달 가능한 vertex와 edge를 제한적으로 보므로 adjacency list에서 `O(V+E)`다. queue에 넣을 때 표시하는지 꺼낼 때 표시하는지는 중복 방문과 부모 기록의 invariant를 함께 고려해야 한다.

### Backend 연결

선수 관계에서 몇 단계 떨어진 concept을 찾거나 관련 콘텐츠를 확장할 때 BFS layer를 depth limit으로 사용할 수 있다. 결과 순서가 API 계약이면 tie-breaker를 고정한다.
