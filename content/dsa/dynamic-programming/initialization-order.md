---
kind: concept
contentKey: dsa.core.dynamic-programming.initialization-order
topicContentKey: dsa.core.dynamic-programming
slug: initialization-order
title: "Initialization and Order"
summary: "base value와 계산 순서가 잘못될 때 생기는 오류를 분석한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# Initialization and Order

DP에서는 transition이 맞아도 base state와 계산 순서가 잘못되면 오답이 된다. 현재 state가 참조하는 predecessor가 **올바른 초기값을 가지고 있고 이미 계산되어 있어야** 하기 때문이다.

Base state는 문제의 가장 작은 정상 subproblem을 나타낸다. Impossible state는 정상 값과 구분해야 한다. 예를 들어 최소화 문제에서 도달 불가능한 state를 0으로 두면 `min()`이 그 값을 가장 좋은 후보로 선택할 수 있으므로 infinity나 별도 sentinel이 필요하다.

계산 순서는 dependency에서 결정된다. `dp[i]`가 `dp[i-1]`, `dp[i-2]`에 의존하면 작은 i부터 계산해야 한다. Interval DP처럼 짧은 구간에 의존한다면 length가 작은 순서부터 진행해야 한다.

Space optimization으로 한 배열을 덮어쓸 때는 순서가 문제 constraint를 직접 표현하기도 한다. 0/1 knapsack의 1차원 DP는 같은 item을 현재 iteration에서 다시 사용하지 않도록 capacity를 큰 값에서 작은 값으로 순회한다.

따라서 초기화와 loop order는 구현 편의가 아니라 **recurrence가 올바른 predecessor state를 읽도록 만드는 correctness 조건**이다.
