---
kind: concept
contentKey: dsa.core.dynamic-programming.memoization
topicContentKey: dsa.core.dynamic-programming
slug: memoization
title: "Memoization"
summary: "top-down 재귀 결과를 cache해 중복 계산을 제거한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# Memoization

Memoization은 top-down recursion을 유지하면서 어떤 state의 결과를 처음 계산한 뒤 저장하고, 같은 state가 다시 요청되면 저장된 값을 반환하는 방법이다.

```text
solve(state):
    if memo에 state가 있으면
        return memo[state]

    result = subproblem 계산
    memo[state] = result
    return result
```

핵심은 cache key가 DP state definition과 정확히 같아야 한다는 것이다. 답이 `(index, capacity)` 두 변수에 의존하는데 index만 key로 사용하면 서로 다른 subproblem의 결과를 잘못 재사용한다.

Memoization의 시간은 단순히 "재귀를 cache했으니 O(n)"이라고 말할 수 없다. 보통 **distinct state 수 × state 하나를 계산할 때 검사하는 transition 비용**으로 분석한다.

또 실제 결과가 0, false 같은 값일 수 있으므로 미계산 상태와 정상 결과를 구분해야 한다. 별도 visited flag나 sentinel을 사용해 `UNCOMPUTED`와 계산 완료 값을 혼동하지 않는다.

Top-down 방식은 target에서 실제로 도달하는 state만 계산할 수 있다는 장점이 있지만 recursion depth가 깊을 수 있다. 같은 recurrence를 bottom-up으로 계산하는 tabulation과 이 trade-off를 비교할 수 있다.
