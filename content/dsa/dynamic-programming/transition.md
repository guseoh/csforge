---
kind: concept
contentKey: dsa.core.dynamic-programming.transition
topicContentKey: dsa.core.dynamic-programming
slug: transition
title: "DP Transition"
summary: "이전 state에서 다음 state와 answer를 만드는 전이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# DP Transition

Transition은 현재 DP state의 answer를 어떤 더 작은 state와 선택으로부터 계산할지 정의하는 recurrence다. 핵심은 **현재 state에서 가능한 선택을 빠짐없이 나누고, 각 선택 뒤 남는 문제를 올바른 predecessor state로 표현하는 것**이다.

0/1 knapsack에서:

```text
dp[i][w]
= 앞의 i개 item을 고려하고 capacity w일 때 최대 value
```

라고 정의했다면 item i를 선택하지 않는 경우와 선택하는 경우를 비교할 수 있다.

```text
dp[i][w] = max(
    dp[i-1][w],
    dp[i-1][w-weight[i]] + value[i]
)
```

두 번째 경우는 capacity가 충분할 때만 유효하다. 또 `i-1` state를 사용하기 때문에 같은 item을 한 번만 선택한다는 0/1 constraint가 recurrence에 반영된다.

Transition에서 가능한 branch를 누락하면 그 branch를 통해서만 얻을 수 있는 optimal solution을 놓친다. 반대로 impossible predecessor를 정상 후보로 포함하면 존재하지 않는 solution이 answer에 섞일 수 있다.

State와 transition은 서로 맞물린다. 필요한 predecessor를 현재 state로 표현할 수 없다면 state definition이 부족한 신호이고, state 의미가 불명확하면 recurrence도 올바르게 만들기 어렵다.
