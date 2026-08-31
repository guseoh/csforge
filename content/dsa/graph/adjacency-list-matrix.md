---
kind: concept
contentKey: dsa.core.graph.adjacency-list-matrix
topicContentKey: dsa.core.graph
slug: adjacency-list-matrix
title: "Adjacency List and Matrix"
summary: "인접 리스트와 행렬의 공간·조회 비용을 비교한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "graph의 경로와 연결성 알고리즘을 확인한다."
    displayOrder: 1
---
# Adjacency List and Matrix

인접 리스트는 각 vertex에 실제 이웃만 저장해 공간이 `O(V+E)`이고 이웃 순회에 유리하다. 인접 행렬은 `V×V` 칸으로 edge 존재를 일정 시간에 확인하지만 sparse graph에서도 `O(V²)` 공간을 사용한다.

dense graph인지, edge 존재 조회가 많은지, 순회가 많은지에 따라 표현을 선택한다. 표현을 바꿔도 graph의 의미는 같지만 iteration 순서가 결과의 안정성에 영향을 주면 정렬 규칙을 별도로 둔다.

### Backend 연결

관련 concept 조회처럼 sparse 관계를 저장하는 기능은 필요한 edge만 가져오는 query가 적합하다. 모든 pair를 미리 만들면 저장·검증 비용이 실제 관계 수보다 커질 수 있다.
