---
kind: concept
contentKey: dsa.core.graph-path.union-find
topicContentKey: dsa.core.graph-path
slug: union-find
title: "Union-Find"
summary: "disjoint set의 find·union으로 연결성을 관리한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/15uf/"
    title: "Algorithms, 4th Edition: Union-Find"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "disjoint set의 연결성 invariant를 확인한다."
    displayOrder: 1
---
# Union-Find

union-find는 서로 겹치지 않는 집합을 parent forest로 표현한다. `find(x)`는 대표를 찾고 `union(a,b)`는 두 대표를 연결해 두 원소가 같은 component인지 빠르게 판정하게 한다.

초기에는 각 원소가 자기 자신이 대표다. union 시 root가 아닌 노드를 연결하고, path compression과 rank/size 기준 연결을 함께 쓰면 많은 연산 sequence의 amortized 비용이 거의 상수에 가까워진다.

### Backend 연결

import된 관계의 연결 component를 일괄 검증하거나 Kruskal의 cycle 판정에 사용할 수 있다. 최종 edge 목록과 component 계산을 분리해 파생 자료구조를 다시 만들 수 있게 한다.

