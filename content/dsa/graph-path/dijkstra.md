---
kind: concept
contentKey: dsa.core.graph-path.dijkstra
topicContentKey: dsa.core.graph-path
slug: dijkstra
title: "Dijkstra"
summary: "non-negative weighted graph에서 최소 tentative distance를 확정하고 relaxation한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "weighted shortest path의 relaxation과 Dijkstra 조건을 확인한다."
    displayOrder: 1
---
# Dijkstra

### 지금 가장 가까운 vertex를 하나씩 확정한다

Dijkstra는 source에서 각 vertex까지 알려진 최단 거리 후보인 `distance[]`를 관리한다. 아직 확정하지 않은 vertex 중 tentative distance가 가장 작은 vertex를 선택하고, 그 vertex에서 나가는 edge를 이용해 neighbor의 distance를 더 줄일 수 있는지 확인한다. 이 갱신을 relaxation이라고 한다.

```text
if dist[u] + weight(u,v) < dist[v]:
    dist[v] = dist[u] + weight(u,v)
    parent[v] = u
```

초기에는 source만 0이고 나머지는 infinity다.

```text
dist[source] = 0
dist[others] = INF
```

### Relaxation을 실제 상태로 따라가기

다음 graph를 보자.

```text
A --4--> B
A --1--> C
C --2--> B
B --1--> D
C --5--> D
```

A를 확정하면 B=4, C=1이 된다. 다음 최소 후보는 C=1이다. C에서 B를 relaxation하면 `1+2=3 < 4`이므로 B가 3으로 줄어든다. D는 6이 된다.

다음 최소 후보 B=3을 확정하고 B→D를 relaxation하면 D는 `3+1=4`로 줄어든다.

```text
확정 순서: A(0) → C(1) → B(3) → D(4)
```

이처럼 distance는 여러 번 개선될 수 있지만 **priority queue에서 꺼낸 최소 후보를 확정하는 순간**에는 non-negative weight 조건 아래 더 짧아질 수 없다.

### 왜 non-negative edge가 필요한가

Dijkstra가 vertex u를 현재 최소 distance로 확정했다고 하자. 아직 확정되지 않은 다른 path를 돌아서 u로 오는 경로는 이미 현재 거리 이상인 vertex에서 시작하고, 이후 edge weight도 0 이상이므로 갑자기 더 작은 값으로 내려갈 수 없다.

하지만 음수 edge가 있으면 이 논리가 깨진다.

```text
A -> B = 2
A -> C = 5
C -> B = -10
```

Dijkstra는 B=2를 먼저 확정할 수 있지만 실제 A→C→B 비용은 -5다. 이미 확정한 B가 나중에 더 짧아지는 모순이 생긴다.

따라서 Dijkstra의 전제는 **reachable edge weight가 non-negative**라는 것이다. 단순히 "대부분 양수"면 충분하지 않다.

### Priority Queue와 stale entry

실용 구현에서는 최소 tentative distance를 빠르게 꺼내기 위해 min-heap priority queue를 사용한다. Decrease-key를 직접 지원하지 않는 구현에서는 distance가 갱신될 때 새 `(distance, vertex)` entry를 push하고 예전 entry를 그대로 둘 수 있다.

```text
(B, 4) push
나중에 B=3으로 개선
(B, 3) push
```

이후 `(B,4)`가 queue에서 나오면 현재 `dist[B]=3`과 다르므로 stale entry로 버린다.

### Parent와 path reconstruction

Relaxation으로 distance를 줄일 때 parent도 함께 갱신해야 한다. 그래야 target에서 parent를 따라 source까지 shortest path를 복원할 수 있다. Distance만 새 값으로 바꾸고 parent를 유지하면 비용과 실제 path가 서로 맞지 않을 수 있다.

### Dijkstra와 BFS의 관계

모든 edge weight가 같은 1이라면 BFS가 더 단순하고 효율적이다. Dijkstra는 서로 다른 non-negative weight가 있을 때 "edge 수"가 아니라 **weight 합**을 최소화한다.

따라서 알고리즘 선택은 graph가 weighted인지뿐 아니라 weight의 범위와 의미까지 보고 결정한다.
