---
kind: concept
contentKey: dsa.core.dynamic-programming.representative-dp-patterns
topicContentKey: dsa.core.dynamic-programming
slug: representative-dp-patterns
title: "Representative DP Patterns"
summary: "선형·격자·배낭 모양을 state-transition으로 변환하는 기준을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# Representative DP Patterns

DP 문제를 sequence, grid, knapsack, interval 같은 모양으로 분류하면 state 후보를 떠올리는 데 도움이 된다. 하지만 pattern 이름보다 중요한 것은 **어떤 정보가 future decision을 결정하고, 어떤 predecessor에서 현재 state를 계산하는가**다.

Sequence 문제에서는 position이나 prefix 길이가 state 축이 되기 쉽다. Grid에서는 `(row, column)`, 제한 resource가 있는 knapsack에서는 `(item index, capacity)`, 구간을 합치는 문제에서는 `(left, right)`가 자연스러운 후보가 된다.

```text
sequence : dp[i]
grid     : dp[r][c]
knapsack : dp[i][w]
interval : dp[l][r]
```

하지만 같은 입력 모양이라도 constraint가 추가되면 state도 달라질 수 있다. Grid에서 이전 이동 방향이 비용에 영향을 준다면 좌표만으로 충분하지 않고 direction도 state에 포함해야 한다.

Pattern은 correctness proof가 아니다. State가 충분한지, transition이 모든 선택을 포함하는지, base와 계산 순서가 맞는지, 그리고 `state count × transition cost`가 실제 constraint 안에 들어오는지를 각각 확인해야 한다.

대표 패턴의 목적은 문제를 암기하는 것이 아니라 **낯선 문제를 state와 transition 구조로 바꾸는 출발점**을 제공하는 것이다.
