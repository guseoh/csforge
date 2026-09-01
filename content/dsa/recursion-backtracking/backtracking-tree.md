---
kind: concept
contentKey: dsa.core.recursion-backtracking.backtracking-tree
topicContentKey: dsa.core.recursion-backtracking
slug: backtracking-tree
title: "Backtracking Tree"
summary: "선택·탐색·복구를 반복하며 search space를 상태 tree로 탐색한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "재귀 탐색에서 상태 수와 실행 비용을 분석하는 관점을 확인한다."
    displayOrder: 1
---
# Backtracking Tree

### 선택 하나가 새로운 상태를 만든다

Backtracking은 가능한 선택을 하나 적용해 상태를 바꾸고, 그 상태에서 더 깊이 탐색한 뒤, 탐색이 끝나면 선택을 되돌려 다른 선택을 시도하는 방법이다. 탐색 과정 전체를 tree로 보면 각 node는 지금까지의 선택으로 만들어진 partial state이고 edge는 다음 선택 하나를 뜻한다.

예를 들어 숫자 `[1, 2, 3]`의 순열을 만든다고 하자.

```text
[]
├─ [1]
│  ├─ [1,2]
│  │  └─ [1,2,3]
│  └─ [1,3]
├─ [2]
└─ [3]
```

현재 선택 목록과 `used[]` 상태를 바꾸며 내려가고, 한 branch가 끝나면 반드시 원래 상태로 되돌려야 형제 branch가 깨끗한 상태에서 시작한다.

### Choose → Explore → Undo

전형적인 흐름은 다음과 같다.

```text
for candidate in candidates:
    if candidate is invalid:
        continue

    choose(candidate)
    explore(nextState)
    undo(candidate)
```

여기서 `undo`는 단순 구현 세부사항이 아니라 correctness의 일부다. 예를 들어 `[1]` branch에서 `used[2]=true`로 만든 뒤 이를 되돌리지 않으면 `[2]` branch를 시작할 때 이미 2가 사용된 것으로 남아 유효한 답을 잃는다.

Mutable list, bit mask, visited array처럼 여러 상태를 함께 수정한다면 **적용한 순서의 반대로 정확히 복구되는지**를 확인해야 한다. 또는 각 branch마다 immutable snapshot을 만들어 공유 상태 자체를 피할 수도 있지만 allocation 비용이 늘 수 있다.

### Search tree의 크기

Backtracking은 가능한 branch를 대부분 열어봐야 하는 문제에서 지수적 또는 factorial search space를 만들 수 있다. 순열은 대략 `n!`, 각 원소를 선택/미선택하는 부분집합은 `2^n`개의 후보가 생긴다.

따라서 코드 한 호출의 비용이 작다고 전체 알고리즘이 빠른 것은 아니다. 중요한 것은 **branching factor와 depth**다.

```text
대략적인 node 수 ≈ 1 + b + b² + ... + b^d
```

여기서 `b`는 한 상태에서 가능한 선택 수, `d`는 최대 깊이다.

### Constraint와 visited의 역할

Backtracking은 아무 branch나 무조건 끝까지 탐색하지 않는다. 이미 사용한 원소를 다시 선택하지 못하게 하거나 현재 합이 제한을 넘지 못하게 하는 식으로 다음 상태가 유효한지 검사한다.

Graph 탐색에서 visited가 cycle을 막는 것과 유사하지만, backtracking에서는 visited state를 **branch-local하게 되돌려야 하는 경우**가 많다. 전역적으로 한 번 방문한 상태를 영원히 막아도 되는지는 문제 정의에 따라 다르다.

### 결과를 저장할 때의 함정

현재 mutable list 자체를 결과 목록에 넣으면 이후 `undo()`가 같은 객체를 수정하면서 이미 저장한 결과까지 바뀔 수 있다. 따라서 leaf에서 결과를 저장할 때는 필요한 경우 snapshot을 복사해야 한다.

```text
잘못된 예: result.add(current)
필요한 경우: result.add(copy(current))
```

이 문제는 backtracking의 상태 lifetime을 이해했는지 확인하는 대표적인 correctness 포인트다.

### 실제 시스템과의 경계

규칙 조합, configuration 후보, permission 조합처럼 작은 bounded search space에서는 backtracking이 유용할 수 있다. 그러나 요청 하나가 외부 입력에 따라 무제한 branch를 만들 수 있다면 CPU와 memory를 고갈시킬 수 있다.

실무에서는 depth, candidate 수, time budget을 제한하고 탐색 중간 상태를 canonical data와 분리해야 한다. timeout으로 중단한 결과가 완전 탐색 결과인지 partial result인지도 호출자에게 명확히 알려야 한다.
