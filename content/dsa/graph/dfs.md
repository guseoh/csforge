---
kind: concept
contentKey: dsa.core.graph.dfs
topicContentKey: dsa.core.graph
slug: dfs
title: "DFS"
summary: "현재 경로를 stack으로 유지하며 discovery·finish 상태를 추적한다."
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

### 한 경로를 끝까지 따라간 뒤 되돌아온다

Depth-First Search는 현재 vertex에서 방문하지 않은 이웃 하나를 선택해 가능한 만큼 깊이 내려간 뒤, 더 갈 곳이 없으면 이전 vertex로 돌아와 다음 이웃을 탐색한다. 재귀 호출을 사용하면 call stack이 현재 경로를 보존하고, 반복 구현에서는 명시적 stack이 같은 역할을 한다.

```text
A
├─ B
│  └─ D
└─ C

방문 예: A → B → D → C
```

BFS가 distance layer를 queue로 유지하는 것과 달리 DFS의 핵심 상태는 **현재 탐색 path**다.

### Discovery와 Finish를 구분한다

단순 reachability만 필요하다면 visited 하나로도 충분할 수 있다. 하지만 directed cycle이나 topological order를 판단하려면 "방문한 적이 있다"만으로는 부족하다.

DFS 상태를 다음처럼 구분할 수 있다.

```text
UNVISITED   아직 발견하지 않음
IN_PROGRESS 현재 DFS 경로 안에 있음
FINISHED    모든 descendant 처리가 끝남
```

Vertex를 처음 만났을 때 `IN_PROGRESS`로 바꾸고 모든 neighbor를 처리한 뒤 `FINISHED`로 바꾼다. Directed graph에서 `IN_PROGRESS` vertex로 향하는 edge를 다시 만나면 현재 경로로 되돌아가는 back edge이므로 cycle이다.

반면 이미 `FINISHED`인 vertex를 보는 것은 다른 branch에서 이미 처리가 끝난 cross/forward edge일 수 있으므로 그것만으로 cycle이라고 할 수 없다.

### Recursive DFS와 explicit stack

재귀 구현은 간결하지만 graph가 긴 chain이면 recursion depth가 vertex 수에 비례할 수 있다.

```text
1 -> 2 -> 3 -> ... -> 1,000,000
```

이런 입력에서는 알고리즘의 시간 복잡도 `O(V+E)`와 별개로 call stack이 먼저 고갈될 수 있다. 큰 입력을 지원해야 한다면 explicit stack으로 상태를 직접 관리하는 방법을 검토한다.

### 시간 복잡도

Adjacency list에서 vertex를 한 번 발견하고 각 adjacency edge를 제한된 횟수 확인하면 `O(V+E)`다. 방문 여부를 제대로 관리하지 않으면 cycle에서 같은 vertex를 반복 처리해 이 보장이 깨진다.

### DFS가 만드는 정보

DFS는 단순 방문 외에도 여러 구조적 정보를 만든다.

- connected component 탐색
- directed cycle detection
- parent tree를 통한 경로 복원
- finish order를 이용한 topological sort
- articulation/bridge 같은 더 깊은 graph algorithm의 기반

각 알고리즘은 같은 DFS를 사용해도 필요한 상태가 다르므로 `visited=true` 하나로 모든 문제를 해결하려고 해서는 안 된다.

### Backend 연결

Prerequisite나 dependency graph 검증에서 DFS는 cycle 경로를 추적하기 좋다. 이때 parent와 recursion path를 보존하면 단순히 "cycle 있음"이 아니라 `A -> B -> C -> A`처럼 사용자가 수정할 수 있는 오류 경로를 제시할 수 있다.
