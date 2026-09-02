---
kind: concept
contentKey: dsa.core.graph.connected-components
topicContentKey: dsa.core.graph
slug: connected-components
title: "Connected Components"
summary: "미방문 정점마다 탐색을 시작해 undirected graph의 연결된 maximal 집합을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "vertex, edge, path, connectivity 같은 graph 기본 모델을 확인한다."
    displayOrder: 1
---
# Connected Components

### 한 시작점에서 도달할 수 있는 범위

Undirected graph에서 connected component는 서로 path로 도달 가능한 vertex들의 **maximal 집합**이다. Maximal이라는 말은 그 집합 바깥의 다른 vertex를 하나 더 넣으면서도 연결 상태를 유지할 수 없다는 뜻이다.

예를 들어 다음 graph에는 세 component가 있다.

```text
A -- B -- C      D -- E      F

component 0: A, B, C
component 1: D, E
component 2: F
```

A에서 BFS나 DFS를 시작하면 A, B, C를 모두 방문하지만 D, E, F에는 도달하지 못한다.

### 전체 component를 찾는 방법

Graph 전체의 component를 찾으려면 모든 vertex를 순회한다. 아직 방문하지 않은 vertex를 만나면 그곳에서 BFS/DFS를 새로 시작하고, 해당 탐색에서 방문한 모든 vertex에 같은 component id를 부여한다.

```text
componentId = 0
for v in vertices:
    if not visited[v]:
        traverse(v, componentId)
        componentId++
```

탐색 시작 횟수가 component 개수가 된다.

### Component id를 저장하는 이유

각 vertex에 component id를 저장하면 전처리 이후 두 vertex가 같은 component인지 빠르게 비교할 수 있다.

```text
connected(u, v) = component[u] == component[v]
```

한 번의 graph snapshot에서 많은 connectivity query를 처리할 때 유용하다. 단, edge가 동적으로 추가·삭제되면 기존 component id가 더 이상 유효하지 않을 수 있다. 정적 graph 탐색과 dynamic connectivity 문제는 구분해야 한다.

### Directed graph에서는 같은 정의를 그대로 쓰지 않는다

Directed graph에서 `u -> v`가 있다고 `v -> u` 경로가 보장되지 않는다. 그래서 undirected connected component 개념을 그대로 적용하면 의미가 모호해진다.

Directed graph에서는 방향을 무시한 weakly connected component와 서로 양방향으로 도달 가능한 strongly connected component를 구분한다. 현재 Concept의 기본 알고리즘은 undirected graph의 connected component를 대상으로 한다.

### Isolated vertex도 component다

Edge가 하나도 없는 vertex도 자기 자신만 포함하는 component다. 전체 vertex를 순회할 때 edge가 있는 vertex만 시작점으로 보면 이런 isolated component를 놓친다.

이 때문에 graph representation에서도 vertex 목록과 edge 목록을 별도로 보존하는 것이 중요할 수 있다.

### 실제 활용

콘텐츠 관계 graph에서 서로 완전히 떨어진 묶음을 찾거나 테스트 fixture에서 의도치 않게 고립된 node를 찾는 데 component 분석을 사용할 수 있다. 다만 component가 다르다는 사실이 곧 접근 권한이나 tenant 격리를 뜻하는 것은 아니다. Graph connectivity는 자료구조 관계이고 authorization은 별도 domain policy다.
