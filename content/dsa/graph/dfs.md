---
kind: concept
contentKey: dsa.core.graph.dfs
topicContentKey: dsa.core.graph
slug: dfs
title: "DFS"
summary: "stack/recursion과 방문·완료 상태를 추적한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "vertex, edge, path, connectivity 같은 graph 기본 모델을 확인한다."
    displayOrder: 1
---
# DFS

Depth-First Search(DFS)는 현재 vertex에서 아직 방문하지 않은 neighbor를 따라 가능한 만큼 깊이 내려간 뒤, 더 진행할 곳이 없으면 이전 vertex로 돌아와 다른 branch를 탐색한다.

재귀 구현에서는 call stack이 현재 탐색 path를 저장하고, 반복 구현에서는 explicit stack을 사용한다.

단순 reachability라면 visited 여부만으로 충분할 수 있지만, directed cycle이나 topological ordering처럼 탐색 진행 상태가 중요한 문제에서는 다음처럼 구분할 수 있다.

```text
UNVISITED   아직 발견하지 않음
IN_PROGRESS 현재 DFS path 안에 있음
FINISHED    모든 neighbor 처리 완료
```

Vertex를 처음 발견하면 `IN_PROGRESS`, 모든 neighbor 탐색이 끝나면 `FINISHED`로 바꾼다. 이 상태 구분을 통해 현재 path의 ancestor로 돌아가는 edge와 이미 처리가 끝난 vertex를 가리키는 edge를 다르게 해석할 수 있다.

Adjacency list에서는 각 vertex와 edge를 제한된 횟수만 확인하므로 시간은 O(V+E)다. 다만 매우 긴 chain에서는 recursion depth가 O(V)까지 커질 수 있으므로 total work와 maximum stack depth를 별도로 생각해야 한다.

DFS의 핵심은 단순히 깊게 간다는 표현보다 **현재 탐색 path와 vertex의 discovery/finish state를 어떻게 유지하는가**에 있다.
