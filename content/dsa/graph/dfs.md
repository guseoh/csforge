---
kind: concept
contentKey: dsa.core.graph.dfs
topicContentKey: dsa.core.graph
slug: dfs
title: "깊이 우선 탐색(DFS)"
summary: "스택/재귀와 방문·완료 상태를 추적한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "무방향 그래프 표현, BFS 최단 경로, DFS와 연결 요소 탐색을 확인한다."
    displayOrder: 1
---
# 깊이 우선 탐색(DFS)

Depth-First Search(DFS)는 현재 정점에서 아직 방문하지 않은 neighbor를 따라 가능한 만큼 깊이 내려간 뒤, 더 진행할 곳이 없으면 이전 정점으로 돌아와 다른 분기를 탐색한다.

재귀 구현에서는 call 스택이 현재 탐색 경로를 저장하고, 반복 구현에서는 explicit 스택을 사용한다.

단순 reachability라면 visited 여부만으로 충분할 수 있지만, directed cycle이나 topological ordering처럼 탐색 진행 상태가 중요한 문제에서는 다음처럼 구분할 수 있다.

```text
UNVISITED   아직 발견하지 않음
IN_PROGRESS 현재 DFS path 안에 있음
FINISHED    모든 neighbor 처리 완료
```

정점을 처음 발견하면 `IN_PROGRESS`, 모든 neighbor 탐색이 끝나면 `FINISHED`로 바꾼다. 이 상태 구분을 통해 현재 경로의 ancestor로 돌아가는 간선과 이미 처리가 끝난 정점을 가리키는 간선을 다르게 해석할 수 있다.

Adjacency list에서는 각 정점과 간선을 제한된 횟수만 확인하므로 시간은 O(V+E)다. 다만 매우 긴 chain에서는 재귀 깊이가 O(V)까지 커질 수 있으므로 total work와 maximum 스택 깊이를 별도로 생각해야 한다.

DFS의 핵심은 단순히 깊게 간다는 표현보다 **현재 탐색 경로와 정점의 discovery/finish 상태를 어떻게 유지하는가**에 있다.
