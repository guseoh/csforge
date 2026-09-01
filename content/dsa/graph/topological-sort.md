---
kind: concept
contentKey: dsa.core.graph.topological-sort
topicContentKey: dsa.core.graph
slug: topological-sort
title: "Topological Sort"
summary: "DAG의 선행 관계를 indegree 또는 DFS finish order로 선형화하고 cycle을 판정한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/42digraph/"
    title: "Algorithms, 4th Edition: Directed Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "DAG, cycle과 topological ordering의 관계를 확인한다."
    displayOrder: 1
---
# Topological Sort

### 선행 관계를 만족하는 선형 순서

Directed graph의 edge `u -> v`를 "u가 v보다 먼저 처리되어야 한다"는 선행 관계로 해석하자. Topological order는 모든 edge에 대해 u가 v보다 앞에 오도록 vertex 전체를 나열한 순서다.

예를 들어:

```text
A -> C
B -> C
C -> D
```

가능한 topological order는 `A, B, C, D` 또는 `B, A, C, D`다. A와 B 사이에는 직접 선행 관계가 없으므로 둘의 상대 순서는 여러 답이 가능하다.

### DAG에서만 존재한다

`A -> B -> C -> A` 같은 cycle이 있으면 A가 B보다 먼저, B가 C보다 먼저, C가 다시 A보다 먼저여야 하므로 모순이다. 따라서 topological order는 Directed Acyclic Graph, 즉 DAG에서만 존재한다.

Topological sort를 수행하면서 cycle까지 함께 감지하는 이유다.

### Kahn 알고리즘: indegree가 0인 정점부터 제거

Indegree는 해당 vertex로 들어오는 edge 수다. 선행 조건이 하나도 남지 않은 vertex는 현재 시점에 처리할 수 있다.

```text
1. 모든 vertex의 indegree 계산
2. indegree=0 vertex를 queue에 추가
3. queue에서 하나 꺼내 output에 기록
4. 그 vertex의 outgoing edge를 제거한 효과로 neighbor indegree 감소
5. 새로 indegree=0이 된 neighbor를 queue에 추가
```

예를 들어 `A -> C`, `B -> C`, `C -> D`라면 처음 indegree 0은 A와 B다. 둘을 모두 제거한 뒤에야 C의 indegree가 0이 되고, C가 제거된 뒤 D가 가능해진다.

### 처리한 vertex 수로 cycle을 판정한다

Kahn 알고리즘이 끝났는데 output vertex 수가 전체 V보다 작다면 남은 vertex들은 서로 선행 조건을 제거하지 못하는 구조를 가진다. Directed graph에서는 cycle이 남아 있다는 뜻이다.

```text
processedCount < V
→ valid topological order 없음
```

이 경우 일부 output만 정상 순서라고 반환하면 안 된다. 전체 dependency ordering이 필요한 계약이라면 cycle 오류로 처리해야 한다.

### DFS finish order 방식

DFS에서는 어떤 vertex의 모든 outgoing dependency를 탐색한 뒤 finish한다. DAG에서 finish order의 역순을 사용하면 topological order를 얻을 수 있다.

다만 DFS 방식에서도 current recursion path의 vertex로 돌아가는 back edge가 발견되면 cycle이므로 결과를 반환해서는 안 된다.

### 여러 정답과 deterministic ordering

DAG는 topological order가 하나만 존재한다는 보장이 없다. Kahn 알고리즘에서 indegree 0인 vertex가 여러 개라면 어느 것을 먼저 뽑느냐에 따라 결과가 달라진다.

```text
available: A, B, C
```

결과 재현성이 중요하다면 stable key, displayOrder, priority queue 같은 tie-break rule을 명시할 수 있다. 이 정렬 규칙은 dependency correctness와 별개다. 어떤 tie-break를 사용해도 모든 edge의 선행 관계만 지키면 topological order다.

### 실제 적용

Migration, build dependency, curriculum prerequisite처럼 선행 관계가 있는 작업의 처리 순서를 만들 때 사용할 수 있다. 그러나 edge 방향의 의미부터 정확히 정의해야 한다. `A depends on B`를 `A -> B`로 저장했는지 `B -> A`로 저장했는지에 따라 output 해석이 달라진다.

따라서 topological sort 오류를 조사할 때 알고리즘만 보지 말고 graph modeling, indegree 계산, cycle 경로, tie-break contract를 함께 확인해야 한다.
