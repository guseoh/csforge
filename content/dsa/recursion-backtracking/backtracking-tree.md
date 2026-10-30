---
kind: concept
contentKey: dsa.core.recursion-backtracking.backtracking-tree
topicContentKey: dsa.core.recursion-backtracking
slug: backtracking-tree
title: "백트래킹 탐색 트리"
summary: "선택·복구로 탐색 상태를 분기하고 되돌리는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/lectures/keynote/67CombinatorialSearch.pdf"
    title: "Combinatorial Search (Algorithms, 4th Edition)"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "백트래킹 탐색 트리, 재귀 선택, 막다른 경로와 가지치기 예시를 확인한다."
    displayOrder: 1
---
# 백트래킹 탐색 트리

백트래킹은 가능한 선택을 하나 적용해 다음 상태로 내려가고, 그 분기 탐색이 끝나면 선택을 되돌려 다른 선택을 시도하는 방법이다. 탐색 전체를 보면 각 노드는 지금까지의 선택으로 만들어진 **부분 상태**이고, 간선은 다음 선택 하나를 뜻한다.

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

코드에서 `undo`로 표현한 복구는 단순한 정리 작업이 아니라 정확성의 일부다. 한 분기에서 바꾼 `used`나 현재 경로 같은 **변경 가능한 상태**를 되돌리지 않으면 다음 형제 분기가 잘못된 상태에서 시작한다.

백트래킹의 비용은 한 번의 재귀 호출보다 **탐색 트리 전체 크기**에 좌우된다. 한 상태에서 가능한 선택 수가 많고 탐색 깊이가 깊어질수록 가능한 노드 수가 빠르게 증가하며, 순열처럼 `n!`, 부분집합처럼 `2^n` 규모가 되기도 한다.

따라서 핵심은 **현재 상태가 무엇인지, 어떤 선택으로 다음 상태를 만들고, 분기가 끝난 뒤 어떤 상태를 정확히 복구해야 하는지**를 명확히 하는 것이다.
