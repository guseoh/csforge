---
kind: concept
contentKey: dsa.core.graph-path.bellman-ford
topicContentKey: dsa.core.graph-path
slug: bellman-ford
title: "Bellman-Ford"
summary: "edge relaxation을 최대 V-1번 반복해 음수 edge를 처리하고 reachable negative cycle을 감지한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "all-pairs shortest path와 relaxation 관점을 확인한다."
    displayOrder: 1
---
# Bellman-Ford

### Dijkstra처럼 일찍 확정하지 않는다

Bellman-Ford는 edge weight가 음수일 수 있는 single-source shortest path 문제를 처리한다. Dijkstra처럼 "현재 최소 후보는 이제 확정"이라고 가정하지 않고, graph의 모든 edge를 반복해서 relaxation하며 더 짧은 경로가 전파되기를 기다린다.

초기 상태는 source만 0이고 나머지는 infinity다.

```text
dist[source] = 0
dist[others] = INF
```

각 edge `u -> v (w)`에 대해 다음을 반복한다.

```text
if dist[u] != INF and dist[u] + w < dist[v]:
    dist[v] = dist[u] + w
    parent[v] = u
```

`dist[u] != INF` 조건은 아직 source에서 도달하지 못한 vertex의 값을 사용하지 않기 위한 것이다.

### 왜 최대 V-1번인가

Negative cycle을 사용하지 않는 단순 shortest path는 같은 vertex를 두 번 방문할 필요가 없다. Vertex가 V개라면 단순 path가 포함할 수 있는 edge 수는 최대 `V-1`개다.

한 번의 전체 edge pass마다 "최대 한 edge 더 긴 shortest path 정보"가 전파된다고 생각할 수 있다. 따라서 `V-1`번 모든 edge를 relaxation하면 cycle을 반복하지 않는 모든 shortest path가 반영될 수 있다.

예를 들어 source에서 target까지 shortest path가 세 edge라면 edge 순서가 불리해도 반복 pass를 통해 distance가 차례로 전파된다.

### 음수 edge 자체는 문제지만, 음수 cycle은 더 다르다

음수 edge가 존재한다고 shortest path가 정의되지 않는 것은 아니다.

```text
A -> B = 4
A -> C = 5
C -> B = -3
```

A→C→B 비용 2처럼 유효한 finite shortest path를 가질 수 있다. Bellman-Ford는 이런 경우를 처리한다.

문제는 source에서 도달 가능한 negative cycle이다.

```text
B -> C = 1
C -> B = -3
cycle total = -2
```

이 cycle을 한 번 돌 때마다 path cost를 2씩 더 낮출 수 있으므로 "가장 작은 유한 거리"가 존재하지 않는다.

### 추가 pass로 negative cycle을 감지한다

`V-1`번 relaxation한 뒤 한 번 더 모든 edge를 확인했는데 distance가 또 줄어든다면, source에서 도달 가능한 negative cycle의 영향을 받는 경로가 있다는 뜻이다.

```text
V-1 pass 이후
추가 relaxation 가능
→ reachable negative cycle 존재
```

여기서 **source에서 reachable**이라는 조건이 중요하다. Graph 어딘가에 negative cycle이 있어도 source에서 그 component에 갈 수 없다면 해당 single-source shortest path 결과에는 영향을 주지 않는다.

### 조기 종료

어떤 pass에서도 distance가 하나도 갱신되지 않았다면 이후 pass에서도 새 shortest path가 나타나지 않는다. 이 경우 `V-1`까지 기다리지 않고 종료할 수 있다.

하지만 이 최적화는 correctness의 핵심이 아니라 이미 안정화된 상태를 감지하는 optimization이다.

### 결과 상태를 구분한다

Bellman-Ford의 결과를 단순 distance array 하나로만 해석하면 안 된다.

- source에서 도달 가능하고 finite shortest path가 있음
- source에서 도달 불가능함
- reachable negative cycle 때문에 finite shortest path가 정의되지 않음

이 세 상태는 의미가 다르다. Negative cycle을 임의의 큰 음수 값 하나로 표현하면 caller가 정상 거리와 오류 상태를 구분하기 어렵다.

### Dijkstra와 선택 기준

Non-negative weight가 보장되면 priority queue 기반 Dijkstra가 일반적으로 더 효율적이다. 음수 edge가 가능하거나 negative cycle 진단이 필요하면 Bellman-Ford가 후보가 된다.

즉 선택 기준은 "weighted graph인가"가 아니라 **weight가 음수가 될 수 있는가, negative cycle을 어떻게 처리할 것인가**다.
