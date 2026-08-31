---
kind: concept
contentKey: dsa.core.graph.graph-model
topicContentKey: dsa.core.graph
slug: graph-model
title: "Graph Model"
summary: "vertex와 edge의 방향·가중치로 관계 문제를 모델링한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "graph의 경로와 연결성 알고리즘을 확인한다."
    displayOrder: 1
---
# Graph Model

graph는 vertex 집합과 vertex 사이 관계인 edge로 구성된다. edge가 한 방향이면 directed graph, 비용이나 거리 속성이 있으면 weighted graph이며 문제의 관계를 어떤 형태로 모델링하느냐가 알고리즘 선택을 바꾼다.

같은 vertex 쌍에 여러 edge가 허용되는지, self-loop가 가능한지, 방향과 weight가 의미를 갖는지를 먼저 정한다. 이 계약이 모호하면 traversal의 방문 규칙과 경로 결과를 재현하기 어렵다.

### Backend 연결

선수 지식, 관련 문서, 의존 콘텐츠를 graph로 모델링하면 cycle과 orphan을 검증할 수 있다. edge를 canonical key로 식별하고 중복 저장 정책을 정해야 import가 idempotent해진다.
