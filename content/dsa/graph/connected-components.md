---
kind: concept
contentKey: dsa.core.graph.connected-components
topicContentKey: dsa.core.graph
slug: connected-components
title: "Connected Components"
summary: "미방문 정점에서 탐색을 반복해 component를 센다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "graph의 경로와 연결성 알고리즘을 확인한다."
    displayOrder: 1
---
# Connected Components

undirected graph에서 한 vertex에서 서로 도달 가능한 정점의 maximal 집합이 connected component다. 전체 vertex를 순회하며 아직 방문하지 않은 정점마다 BFS나 DFS를 시작하면 각 탐색 하나가 하나의 component를 표시한다.

component 번호를 각 vertex에 기록하면 두 정점이 같은 component인지 `O(1)`에 비교할 수 있다. directed graph에서는 weakly connected와 strongly connected의 정의가 다르므로 같은 절차를 그대로 적용하지 않는다.

### Backend 연결

학습 영역 관계에서 고립된 subtree나 서로 연결되지 않은 묶음을 점검할 수 있다. component 통계는 canonical 관계에서 계산하고 검색 색인은 파생 결과로 취급한다.
