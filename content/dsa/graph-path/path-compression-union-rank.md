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
    recommendation: "disjoint set의 연결성 invariant를 확인한다."
    displayOrder: 1
---
# Path Compression and Union by Rank

path compression은 find 중 지나온 모든 노드를 대표에 직접 연결한다. union by rank 또는 size는 작은 tree를 큰 tree 아래에 붙여 parent tree가 불필요하게 깊어지는 것을 막는다.

두 최적화는 개별 연산 하나의 worst case를 단순히 `O(1)`로 만드는 것이 아니라 sequence의 amortized 비용을 줄인다. rank는 실제 높이와 같지 않을 수 있으므로 연결 후 갱신 규칙을 지켜야 한다.

### Backend 연결

대량 관계 검증에서 반복 find 비용을 줄일 수 있다. 하지만 union-find는 삭제와 원래 경로 복원에 약하므로 mutable graph의 일반 저장소를 대체하지 않는다.

