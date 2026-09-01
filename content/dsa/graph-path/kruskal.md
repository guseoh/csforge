---
kind: concept
contentKey: dsa.core.graph-path.kruskal
topicContentKey: dsa.core.graph-path
slug: kruskal
title: "Kruskal"
summary: "edge를 weight 순으로 보며 서로 다른 component를 잇는 safe edge만 선택한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "Kruskal의 edge ordering과 cycle avoidance를 확인한다."
    displayOrder: 1
---
# Kruskal

### 가장 가벼운 edge부터 본다

Kruskal은 graph의 모든 edge를 weight 오름차순으로 정렬한 뒤, 현재까지 선택한 forest에서 서로 다른 component를 잇는 edge만 선택한다.

```text
for edge in sortedEdges:
    if find(edge.u) != find(edge.v):
        select(edge)
        union(edge.u, edge.v)
```

Union-Find가 현재 두 endpoint가 이미 같은 component인지 빠르게 판정해준다.

### 왜 같은 component의 edge는 건너뛰는가

이미 `u`와 `v`가 같은 component라면 선택된 edge들만으로 u에서 v로 가는 path가 존재한다. 여기에 `(u,v)`를 추가하면 cycle이 생긴다.

MST는 tree여야 하므로 이 edge는 선택하지 않는다.

```text
A --1-- B --2-- C
 \-----4------/

A-B, B-C를 이미 선택했다면
A-C를 추가하면 cycle
```

### 작은 예를 따라가기

다음 edge가 있다고 하자.

```text
A-B 1
B-C 2
A-C 3
C-D 4
B-D 5
```

Weight 순으로 보면:

1. A-B 선택 → {A,B}
2. B-C 선택 → {A,B,C}
3. A-C는 같은 component → skip
4. C-D 선택 → {A,B,C,D}

V=4이므로 edge 3개를 선택했고 MST가 완성된다. Total weight는 `1+2+4=7`이다.

### Greedy 선택이 안전한 이유

현재 forest의 component를 서로 다른 vertex 집합으로 보면, 서로 다른 두 component를 연결하는 가장 가벼운 edge는 적절한 cut을 가로지르는 safe edge로 볼 수 있다. Cut property 때문에 이 greedy 선택을 포함하는 MST가 존재한다.

Kruskal은 "전체에서 가장 싼 edge라서 무조건 선택"하는 알고리즘이 아니다. **Cycle을 만들지 않는다는 조건을 통과한 가장 싼 edge**를 선택한다.

### 시간 복잡도

모든 edge를 정렬하는 `O(E log E)` 비용이 일반적으로 지배적이다. 각 edge마다 Union-Find find/union을 수행하지만 path compression과 union by rank를 사용하면 amortized cost가 매우 작다.

### Disconnected graph

Graph가 disconnected라면 모든 edge를 처리해도 선택한 edge 수가 `V-1`에 도달하지 못한다. 이 경우 하나의 MST가 아니라 component별 Minimum Spanning Forest가 만들어진다.

입력 계약이 connected graph를 요구한다면 실패로 처리하고, forest가 유효한 요구라면 결과 타입에서 이를 명시해야 한다.

### 동일 weight와 deterministic output

같은 weight의 edge가 여러 개라면 어떤 edge를 먼저 보느냐에 따라 서로 다른 MST가 나올 수 있다. Total weight는 같더라도 edge 집합은 다를 수 있다.

결과 재현성이 중요하면 `(weight, stableEdgeKey)`처럼 tie-breaker를 정할 수 있다. 그러나 이 tie-breaker는 MST의 greedy correctness와는 별도 정책이다.
