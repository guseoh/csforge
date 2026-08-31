---
kind: concept
contentKey: dsa.core.graph.topological-sort
topicContentKey: dsa.core.graph
slug: topological-sort
title: "Topological Sort"
summary: "DAG의 선행 관계를 indegree 또는 finish order로 선형화한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/42digraph/"
    title: "Algorithms, 4th Edition: Directed Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "directed graph의 cycle과 순서를 확인한다."
    displayOrder: 1
---
# Topological Sort

topological order는 모든 directed edge `u -> v`에 대해 `u`가 `v`보다 먼저 오는 순서다. 이 순서는 graph가 DAG일 때만 존재하며, Kahn 방식은 indegree가 0인 vertex를 queue에 넣고 제거하면서 다음 indegree를 갱신한다.

DFS의 finish order를 뒤집는 방식도 가능하지만 cycle 상태를 확인해야 한다. 제거된 vertex 수가 전체보다 작으면 남은 subgraph에 cycle이 있는 것이므로 유효한 순서를 반환하지 않는다.

### Backend 연결

concept prerequisite와 import dependency의 Apply 순서를 계산하는 데 사용할 수 있다. 여러 유효 순서가 있더라도 display order와 stable key로 tie-break를 정하면 결과가 재현된다.

