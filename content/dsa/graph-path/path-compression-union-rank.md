---
kind: concept
contentKey: dsa.core.graph-path.path-compression-union-rank
topicContentKey: dsa.core.graph-path
slug: path-compression-union-rank
title: "Path Compression and Union by Rank"
summary: "두 최적화가 parent tree 높이를 줄이는 상태 변화를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/15uf/"
    title: "Algorithms, 4th Edition: Union-Find"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "disjoint-set forest와 connectivity operation을 확인한다."
    displayOrder: 1
---
# Path Compression and Union by Rank

Union-Find의 `find` 비용은 parent tree가 얼마나 깊은지에 영향을 받는다. Root를 임의로 연결하면 긴 chain이 만들어질 수 있기 때문에 path compression과 union by rank/size를 사용해 forest를 얕게 유지한다.

Path compression은 `find(x)`가 root를 찾은 뒤, 그 경로에서 만난 node들의 parent를 root로 직접 바꾼다.

```text
find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]
```

이 변경은 set membership을 바꾸지 않는다. 같은 집합의 원소가 같은 root를 찾는 invariant를 유지하면서 다음 find의 경로만 짧게 만든다.

Union by rank 또는 size는 두 root를 합칠 때 더 작은 tree를 큰 tree 아래에 붙여 불필요한 height 증가를 막는다. Rank는 union 방향을 결정하기 위한 높이의 근사·상한 정보이며 path compression 이후 실제 height와 같을 필요는 없다.

두 최적화를 함께 사용하면 긴 operation sequence에서 find/union의 amortized cost가 매우 작아진다. 이론적으로 inverse Ackermann function `α(n)`으로 표현하지만, 핵심은 개별 연산을 항상 O(1)이라고 보는 것이 아니라 **전체 sequence에서 tree가 계속 얕게 유지된다는 것**이다.
