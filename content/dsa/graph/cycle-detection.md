---
kind: concept
contentKey: dsa.core.graph.cycle-detection
topicContentKey: dsa.core.graph
slug: cycle-detection
title: "사이클 검출(Cycle Detection)"
summary: "undirected parent과 directed 재귀 상태로 cycle을 구분한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/42digraph/"
    title: "Algorithms, 4th Edition: Directed Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "DAG, cycle과 topological ordering의 관계를 확인한다."
    displayOrder: 1
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "무방향 그래프 표현, BFS 최단 경로, DFS와 연결 요소 탐색을 확인한다."
    displayOrder: 2
    relationNote: "무방향 DFS의 parent 처리와 연결 탐색을 보완한다."
---
# 사이클 검출(Cycle Detection)

Cycle은 간선을 따라 출발한 정점으로 다시 돌아오는 경로다. Undirected 그래프와 directed 그래프에서는 이미 방문한 정점을 다시 만났을 때의 의미가 다르므로 판정 상태도 다르다.

Simple undirected 그래프에서는 DFS tree 간선을 따라 parent 정점으로 되돌아가는 것을 무시하고, 다른 이미 방문한 neighbor를 만나면 cycle로 판정할 수 있다. Multigraph에서는 parent 정점이 아니라 parent 간선 ID를 무시해야 한다. 같은 두 정점 사이의 두 번째 parallel 간선과 self-loop는 cycle을 만든다.

Directed 그래프에서는 visited 여부 하나로 충분하지 않다. 다음처럼 현재 DFS 경로 안에 있는지까지 구분해야 한다.

```text
UNVISITED
IN_PROGRESS
FINISHED
```

현재 `IN_PROGRESS`인 정점으로 향하는 간선을 만나면 현재 경로의 ancestor로 돌아가는 back 간선이므로 directed cycle이다. 이미 `FINISHED`인 정점을 가리키는 간선은 그것만으로 cycle을 의미하지 않는다.

핵심은 "전에 본 정점인가"가 아니라 **현재 탐색 경로가 다시 닫히는가**다. 이 차이를 이해하면 DAG의 정상적인 cross 간선을 cycle로 잘못 판단하는 실수를 피할 수 있다.

Directed 그래프에 cycle이 있으면 모든 간선의 선행 관계를 만족하는 위상 순서를 만들 수 없다. 따라서 cycle detection은 topological sort와 직접 연결된다.
