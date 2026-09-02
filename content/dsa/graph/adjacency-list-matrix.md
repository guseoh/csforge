---
kind: concept
contentKey: dsa.core.graph.adjacency-list-matrix
topicContentKey: dsa.core.graph
slug: adjacency-list-matrix
title: "Adjacency List and Matrix"
summary: "graph density와 operation에 따라 adjacency list와 matrix의 공간·조회·순회 비용을 비교한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/41graph/"
    title: "Algorithms, 4th Edition: Undirected Graphs"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "vertex, edge, path, connectivity 같은 graph 기본 모델을 확인한다."
    displayOrder: 1
---
# Adjacency List and Matrix

### 같은 graph도 저장 방식에 따라 operation 비용이 달라진다

Graph의 vertex와 edge 의미가 같아도 메모리에 어떻게 표현하느냐에 따라 조회와 traversal 비용이 달라진다. 가장 기본적인 표현이 adjacency list와 adjacency matrix다.

Adjacency list는 각 vertex가 실제 이웃 목록만 가진다.

```text
A: B, D
B: A, C
C: B
D: A
```

vertex 수를 `V`, edge 수를 `E`라 하면 undirected graph에서 각 edge가 양쪽 목록에 들어가므로 전체 저장량은 상수 배를 무시하면 `O(V+E)`다. 특정 vertex의 모든 이웃을 순회할 때는 그 vertex의 degree만큼만 보면 된다.

### Adjacency matrix

Matrix는 `V × V` 표에서 `(u,v)` 칸이 edge 존재 여부 또는 weight를 나타낸다.

```text
    A B C D
A   0 1 0 1
B   1 0 1 0
C   0 1 0 0
D   1 0 0 0
```

두 vertex 사이에 edge가 있는지 확인하는 작업은 index 두 개로 바로 접근할 수 있어 `O(1)`이다. 하지만 edge가 거의 없는 sparse graph라도 `V²`개의 공간을 확보한다.

### Density가 선택 기준이 된다

가능한 edge 수에 비해 실제 edge가 매우 적다면 adjacency list가 공간 효율적이다. 반대로 vertex 수가 작고 대부분의 vertex pair가 연결된 dense graph라면 matrix의 단순한 access가 유리할 수 있다.

예를 들어 `V=100,000`, `E=200,000`인 sparse graph에서 matrix를 만들면 논리적으로 `10^10`칸이 필요하지만 list는 실제 edge에 비례한다. 반면 `V=100`이고 edge 존재 여부를 매우 자주 조회한다면 matrix의 `O(1)` lookup이 실용적일 수 있다.

### Operation별 비용을 비교한다

대표적인 차이는 다음과 같다.

```text
                    adjacency list       adjacency matrix
공간                O(V+E)               O(V²)
vertex u의 이웃 순회 degree(u)에 비례     O(V)
edge(u,v) 존재 확인  구현에 따라 O(degree) O(1)
전체 BFS/DFS          O(V+E)               O(V²)
```

List 안의 이웃을 hash set으로 관리하면 edge 존재 확인을 빠르게 만들 수 있지만 추가 memory와 hash 비용을 지불한다. 즉 representation 선택도 단순 두 가지 중 하나가 아니라 실제 operation sequence에 맞춰 결정한다.

### 순서도 별도 계약이다

Adjacency list가 hash collection인지 sorted list인지 insertion order list인지에 따라 BFS/DFS 방문 순서가 달라질 수 있다. Reachability 결과 자체는 같더라도 traversal output을 API에서 그대로 노출한다면 결과 재현성이 달라진다.

따라서 deterministic 결과가 필요하면 neighbor iteration order를 별도로 정해야 한다. 자료구조의 논리적 graph 의미와 iteration order 보장은 다른 계약이다.
