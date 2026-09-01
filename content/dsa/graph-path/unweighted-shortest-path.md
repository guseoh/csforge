---
kind: concept
contentKey: dsa.core.graph-path.unweighted-shortest-path
topicContentKey: dsa.core.graph-path
slug: unweighted-shortest-path
title: "Unweighted Shortest Path"
summary: "BFS layer와 parent 상태로 edge 수 기준 최단 거리와 실제 경로를 복원한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "BFS 기반 shortest path와 path reconstruction을 확인한다."
    displayOrder: 1
---
# Unweighted Shortest Path

### Edge 하나의 비용을 모두 1로 본다

Unweighted graph의 shortest path는 실제 거리나 시간이 아니라 **사용한 edge 수가 가장 적은 path**를 찾는다. 모든 edge의 비용을 1이라고 생각하면 BFS가 시작점에서 distance layer를 순서대로 확장하기 때문에 shortest path를 구할 수 있다.

예를 들어 다음 graph를 보자.

```text
A -- B -- D -- F
|    \
C     E
```

A에서 시작하면 A의 distance는 0, B와 C는 1, D와 E는 2, F는 3이다. Queue가 거리 1인 모든 vertex를 거리 2보다 먼저 처리하므로 어떤 vertex를 처음 발견한 순간의 distance가 최소 edge 수다.

### Distance와 Parent를 함께 기록한다

거리만 알면 "몇 단계인가"는 알 수 있지만 실제 어떤 path를 거쳤는지는 알 수 없다. Neighbor를 처음 발견할 때 parent를 함께 기록하면 target에서 source까지 역추적할 수 있다.

```text
distance[A] = 0
parent[A] = null

B를 A에서 발견:
distance[B] = 1
parent[B] = A

D를 B에서 발견:
distance[D] = 2
parent[D] = B
```

D에서 parent를 따라가면 `D <- B <- A`, 즉 실제 path `A -> B -> D`를 복원할 수 있다.

### 도달 불가능과 distance 0을 구분한다

Source 자신은 distance 0이다. 따라서 "아직 도달하지 못함"을 0으로 표시하면 source와 unreachable 상태를 구분할 수 없다. `-1`, infinity, nullable state처럼 별도 sentinel을 사용한다.

```text
A: 0
B: 1
C: -1   // unreachable
```

Visited와 distance array를 함께 사용할 수도 있지만 두 상태의 의미를 섞지 않는 것이 중요하다.

### 왜 weighted graph에서는 그대로 사용할 수 없는가

다음 graph를 생각해보자.

```text
A --100--> B
A --1----> C --1--> B
```

BFS는 A에서 B가 한 edge 떨어져 있으므로 먼저 발견한다. 하지만 비용 합은 직접 path가 100이고 C를 거친 path가 2다. 따라서 edge 수 shortest path와 weight 합 shortest path는 다른 문제다.

모든 edge cost가 동일하지 않다면 weight 조건에 따라 Dijkstra나 Bellman-Ford 같은 알고리즘을 선택해야 한다.

### 실제 의미를 먼저 정의한다

Concept relation에서 "몇 hop 떨어져 있는가"를 구하는 문제라면 unweighted shortest path가 자연스럽다. 그러나 각 prerequisite의 학습 난이도나 시간 비용이 다르다면 단순 hop 수를 최소화하는 것이 실제 학습 비용을 최소화한다는 보장은 없다.

그래서 graph algorithm을 선택하기 전에 edge 하나가 무엇을 의미하고 모든 edge를 같은 비용으로 취급해도 되는지를 먼저 확인해야 한다.
