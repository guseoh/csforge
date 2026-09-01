---
kind: concept
contentKey: dsa.core.graph-path.prim
topicContentKey: dsa.core.graph-path
slug: prim
title: "Prim"
summary: "현재 tree와 바깥 vertex를 잇는 최소 frontier edge를 반복 선택한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://algs4.cs.princeton.edu/43mst/"
    title: "Algorithms, 4th Edition: Minimum Spanning Trees"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "Prim의 frontier와 cut 기반 greedy 선택을 확인한다."
    displayOrder: 1
---
# Prim

### 하나의 tree를 바깥으로 확장한다

Prim은 시작 vertex 하나를 선택하고, 현재 tree에 포함된 vertex 집합과 아직 포함되지 않은 vertex 집합 사이를 잇는 edge 중 가장 가벼운 것을 반복 선택한다.

현재 tree를 `T`라고 하면 candidate는 다음 cut을 가로지르는 edge다.

```text
T 내부  |  T 외부
--------+---------
  u ----|---- v
```

이 frontier edge 중 최소 weight를 선택해 v를 tree 안으로 가져온다.

### 작은 예

```text
A-B 1
A-C 4
B-C 2
B-D 5
C-D 3
```

A에서 시작한다고 하자.

1. T={A}, frontier: A-B(1), A-C(4) → A-B 선택
2. T={A,B}, frontier: A-C(4), B-C(2), B-D(5) → B-C 선택
3. T={A,B,C}, frontier: B-D(5), C-D(3) → C-D 선택

선택 edge는 A-B, B-C, C-D이고 total weight는 6이다.

### Priority Queue와 stale edge

실용 구현에서는 frontier의 최소 edge를 빠르게 고르기 위해 priority queue를 사용한다. 새 vertex가 tree에 들어올 때 그 vertex에서 바깥으로 나가는 edge들을 queue에 추가한다.

하지만 queue 안에는 나중에 양 endpoint가 모두 tree 안으로 들어온 stale edge가 남아 있을 수 있다.

```text
edge(u,v) pop
if u와 v가 모두 이미 tree 내부:
    skip
```

이 검사를 하지 않으면 cycle을 만들거나 이미 포함된 vertex를 다시 처리할 수 있다.

### Cut Property와 greedy 선택

현재 tree vertex 집합과 나머지 graph가 하나의 cut을 만든다. 이 cut을 가로지르는 최소 weight edge는 MST에 포함할 수 있는 safe edge라는 cut property가 Prim의 greedy 선택을 정당화한다.

Kruskal도 cut property를 사용하지만 관점이 다르다. Kruskal은 여러 component로 이루어진 forest를 edge weight 순으로 합치고, Prim은 하나의 tree를 계속 확장한다.

### Complexity는 representation에 따라 달라진다

Adjacency list와 binary heap을 사용하면 일반적으로 `O(E log V)` 또는 구현 표현에 따라 유사한 bound로 분석한다. Dense graph에서 matrix를 사용하는 단순 구현은 `O(V²)`가 될 수 있다.

따라서 graph density와 representation이 실제 선택에 영향을 준다.

### Disconnected graph

Prim은 한 시작점에서 reachable한 component만 확장한다. Graph가 disconnected라면 queue가 비어도 아직 방문하지 않은 vertex가 남는다.

이 경우 입력이 connected여야 한다면 오류이고, 모든 component의 minimum spanning forest가 필요하다면 미방문 vertex에서 Prim을 다시 시작해야 한다.

### Kruskal과 선택 기준

Kruskal은 모든 edge를 정렬하는 방식이라 sparse graph에서 직관적이고 Union-Find와 잘 맞는다. Prim은 현재 tree 주변의 edge만 frontier로 관리한다.

둘 다 MST를 구하지만 "어느 알고리즘이 항상 더 좋다"보다 graph representation, density, 이미 가진 자료구조에 따라 구현 비용을 비교하는 편이 맞다.
