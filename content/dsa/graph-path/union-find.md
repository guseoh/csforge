---
kind: concept
contentKey: dsa.core.graph-path.union-find
topicContentKey: dsa.core.graph-path
slug: union-find
title: "Union-Find"
summary: "disjoint set의 대표를 관리해 dynamic connectivity와 cycle 여부를 판정한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/15uf/"
    title: "Algorithms, 4th Edition: Union-Find"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "disjoint-set forest와 connectivity operation을 확인한다."
    displayOrder: 1
---
# Union-Find

### 여러 원소가 같은 집합인지 빠르게 묻는다

Union-Find, 또는 Disjoint Set Union(DSU)은 서로 겹치지 않는 여러 집합을 관리하면서 두 종류의 operation을 빠르게 수행한다.

- `find(x)`: x가 속한 집합의 대표(root)를 찾는다.
- `union(a,b)`: a와 b가 속한 두 집합을 하나로 합친다.

초기에는 각 원소가 자기 자신만 포함하는 집합이다.

```text
parent[A] = A
parent[B] = B
parent[C] = C
```

`union(A,B)`를 수행하면 두 root 중 하나를 다른 쪽 아래에 연결한다.

```text
A    C
|
B
```

이제 `find(A) == find(B)`이므로 같은 component라는 것을 알 수 있다.

### Parent forest

Union-Find는 일반 graph의 모든 edge를 저장하는 구조가 아니라 **component membership을 표현하는 parent forest**다. 같은 set의 모든 원소는 결국 하나의 root를 공유한다.

```text
A
├─ B
└─ C

find(B) -> A
find(C) -> A
```

대표가 A인지 B인지는 중요하지 않다. 중요한 invariant는 같은 집합의 원소들이 같은 root를 찾고, 다른 집합은 다른 root를 갖는다는 것이다.

### Connectivity query

두 원소가 연결되어 있는지는 다음처럼 확인한다.

```text
connected(a,b) = find(a) == find(b)
```

Edge를 하나씩 추가하는 dynamic connectivity 문제에서 유용하다. 예를 들어 `(A,B)`, `(B,C)`를 union하면 A와 C 사이의 직접 edge를 저장하지 않아도 같은 component임을 알 수 있다.

### Cycle 판정과 Kruskal

Undirected graph에 새 edge `(u,v)`를 추가하려는데 이미 `find(u) == find(v)`라면 두 endpoint 사이에는 기존 path가 존재한다. 그 edge를 추가하면 cycle이 생긴다.

Kruskal 알고리즘은 이 성질을 사용한다.

```text
if find(u) != find(v):
    select edge(u,v)
    union(u,v)
else:
    skip // cycle
```

### 단순 parent 연결만으로는 tree가 깊어질 수 있다

매번 한쪽 root를 다른 root 아래에 임의로 붙이면 chain이 길어질 수 있다.

```text
A <- B <- C <- D <- E
```

이 상태에서 `find(E)`는 여러 parent를 따라가야 한다. 그래서 실제 구현에서는 path compression과 union by rank/size를 함께 사용해 forest를 얕게 만든다.

### Union-Find가 하지 못하는 것

Union-Find는 "같은 component인가"는 빠르게 답하지만 실제 path를 알려주지 않는다. `A`와 `D`가 연결되어 있다는 것은 알 수 있어도 어떤 original edge sequence로 연결됐는지는 parent forest만으로 복원할 수 없다.

또한 edge 삭제에 약하다. 이미 union한 두 component에서 원래 edge 하나를 삭제했다고 parent forest를 간단히 분리할 수 없다. 따라서 mutable graph의 일반 저장소를 대체하는 구조가 아니다.

### 파생 상태로 사용한다

Canonical graph edge가 별도로 존재한다면 Union-Find는 그 edge에서 다시 계산 가능한 파생 자료구조로 보는 편이 안전하다. Connectivity 검사나 Kruskal 수행을 빠르게 하기 위한 상태이지 원본 relation 의미 자체를 대신하지 않는다.
