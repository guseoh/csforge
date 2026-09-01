---
kind: concept
contentKey: dsa.core.graph-path.path-compression-union-rank
topicContentKey: dsa.core.graph-path
slug: path-compression-union-rank
title: "Path Compression and Union by Rank"
summary: "find 경로 압축과 작은 tree 연결로 disjoint-set forest의 높이를 억제한다."
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

### Union-Find의 병목은 깊은 parent chain이다

기본 Union-Find에서 root끼리 아무 방향으로나 연결하면 parent forest가 한쪽으로 길어질 수 있다.

```text
A <- B <- C <- D <- E
```

이 경우 `find(E)`는 E→D→C→B→A를 따라가야 한다. 많은 union과 find가 반복되면 이런 깊이가 전체 비용을 키운다.

이를 줄이는 대표 최적화가 **path compression**과 **union by rank/size**다.

### Path Compression

`find(x)`가 root까지 올라간 뒤, 그 경로에서 만난 node들의 parent를 root로 직접 바꾼다.

```text
find(E) 전
A <- B <- C <- D <- E

find(E) 후
    B
    |
C - A - D
    |
    E
```

실제 모양은 구현에 따라 다르지만 핵심은 다음 find에서 root까지 가는 경로를 짧게 만드는 것이다.

재귀식으로는 다음처럼 표현할 수 있다.

```text
find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]
```

이 과정은 connectivity 의미를 바꾸지 않는다. Parent edge는 원본 graph edge가 아니라 대표를 찾기 위한 내부 구조이므로 root로 직접 연결해도 같은 set membership을 유지한다.

### Union by Rank 또는 Size

두 집합을 합칠 때 작은 tree를 큰 tree 아래에 붙이면 불필요한 깊이 증가를 막을 수 있다.

Size를 사용한다면 원소 수가 적은 root를 큰 root 아래에 붙인다.

```text
size[A] = 8
size[B] = 3

union(A,B)
→ parent[B] = A
```

Rank는 tree 높이의 상한을 나타내는 metadata로 사용할 수 있다. 같은 rank의 root 두 개를 합칠 때만 새 root의 rank가 증가한다.

Path compression을 수행하면 실제 tree 높이는 줄어들 수 있으므로 **rank를 현재 실제 높이와 동일한 값이라고 생각하면 안 된다.** Rank는 union 방향을 결정하기 위한 보조 정보다.

### 두 최적화를 같이 쓰는 이유

Union by rank/size는 tree가 처음부터 너무 깊어지는 것을 막고, path compression은 실제 find가 지나간 경로를 이후 더 짧게 만든다. 두 전략을 함께 사용하면 긴 operation sequence의 amortized cost가 매우 작아져 실용적으로 거의 상수 시간처럼 동작한다.

정확한 이론적 bound는 inverse Ackermann function `α(n)`을 사용해 표현하지만, 학습의 핵심은 특정 함수 이름보다 **개별 find 하나가 항상 O(1)이라는 뜻이 아니라 긴 sequence 전체에서 평균 비용이 매우 작아진다는 것**이다.

### Connectivity invariant와 optimization state를 구분한다

Union-Find correctness는 같은 component의 모든 원소가 같은 root를 찾는다는 데 있다. Rank 값이나 parent tree 모양 자체는 정답이 아니다.

따라서 테스트에서도 다음을 구분하는 편이 좋다.

- connectivity 결과가 맞는가
- parent가 cycle 없이 root에 도달하는가
- rank/size 갱신 규칙이 유지되는가
- path compression 이후에도 component membership이 변하지 않는가

### 삭제에는 여전히 약하다

Path compression과 union by rank가 아무리 빨라도 이미 union한 component에서 edge 하나를 삭제해 component를 다시 분리하는 문제를 해결하지는 못한다. 이 구조는 주로 edge가 추가되는 connectivity나 Kruskal처럼 **merge 중심 작업**에 적합하다.
