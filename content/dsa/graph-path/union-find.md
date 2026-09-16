---
kind: concept
contentKey: dsa.core.graph-path.union-find
topicContentKey: dsa.core.graph-path
slug: union-find
title: "Union-Find"
summary: "disjoint set의 find·union으로 연결성을 관리하는 invariant를 설명한다."
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

Union-Find(Disjoint Set Union)는 서로 겹치지 않는 여러 집합을 관리하며 두 가지 핵심 operation을 제공한다.

- `find(x)`: x가 속한 집합의 대표 root를 찾는다.
- `union(a,b)`: 두 원소가 속한 집합을 하나로 합친다.

초기에는 각 원소가 자기 자신을 root로 가진다. Union을 수행하면 서로 다른 두 root 중 하나를 다른 쪽 아래에 연결한다.

Correctness의 핵심 invariant는 **같은 집합에 속한 원소들은 같은 root를 찾고, 다른 집합의 원소들은 다른 root를 찾는 것**이다.

```text
connected(a,b) = find(a) == find(b)
```

Undirected graph에서 새 edge `(u,v)`를 추가하려 할 때 이미 `find(u) == find(v)`라면 두 vertex 사이에 기존 path가 있다. 이 edge를 추가하면 cycle이 생긴다. Kruskal은 이 성질을 사용해 cycle을 만드는 edge를 건너뛴다.

단순 구현에서 root를 임의로 연결하면 parent tree가 길어져 `find`가 느려질 수 있다. 이를 줄이기 위해 path compression과 union by rank/size를 사용한다.

Union-Find는 component membership을 관리하는 구조이지 실제 graph path를 저장하는 구조가 아니다. 두 vertex가 연결되었는지는 알 수 있지만 어떤 edge sequence로 연결되었는지는 별도 graph 정보가 필요하다.
