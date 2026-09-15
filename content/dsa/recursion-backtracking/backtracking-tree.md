---
kind: concept
contentKey: dsa.core.recursion-backtracking.backtracking-tree
topicContentKey: dsa.core.recursion-backtracking
slug: backtracking-tree
title: "Backtracking Tree"
summary: "선택·복구로 탐색 상태를 분기하고 되돌리는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Backtracking Tree

Backtracking은 가능한 선택을 하나 적용해 다음 상태로 내려가고, 그 branch 탐색이 끝나면 선택을 되돌려 다른 선택을 시도하는 방법이다. 탐색 전체를 보면 각 node는 지금까지의 선택으로 만들어진 partial state이고, edge는 다음 선택 하나를 뜻한다.

```text
[]
├─ [1]
│  ├─ [1,2]
│  └─ [1,3]
├─ [2]
└─ [3]
```

전형적인 흐름은 다음과 같다.

```text
choose(candidate)
explore(nextState)
undo(candidate)
```

`undo`는 단순한 정리 작업이 아니라 correctness의 일부다. 한 branch에서 바꾼 `used`, current path 같은 mutable state를 되돌리지 않으면 다음 형제 branch가 잘못된 상태에서 시작한다.

Backtracking의 비용은 한 번의 재귀 호출보다 search tree 전체 크기에 좌우된다. Branching factor가 b이고 depth가 d라면 가능한 node 수가 매우 빠르게 증가할 수 있고, 순열처럼 `n!`, 부분집합처럼 `2^n` 규모가 되기도 한다.

따라서 핵심은 **현재 state가 무엇인지, 어떤 선택으로 다음 state를 만들고, branch가 끝난 뒤 어떤 state를 정확히 복구해야 하는지**를 명확히 하는 것이다.
