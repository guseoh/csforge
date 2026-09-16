---
kind: concept
contentKey: dsa.core.dynamic-programming.tabulation
topicContentKey: dsa.core.dynamic-programming
slug: tabulation
title: "Tabulation"
summary: "base state부터 dependency 순으로 bottom-up 표를 채운다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# Tabulation

Tabulation은 base state부터 시작해 필요한 predecessor가 이미 계산된 순서로 DP table을 채우는 bottom-up 방식이다.

Fibonacci라면 다음처럼 작은 state부터 계산할 수 있다.

```text
dp[0] = 0
dp[1] = 1
for i = 2..n:
    dp[i] = dp[i-1] + dp[i-2]
```

중요한 것은 loop 방향 자체가 아니라 **현재 state가 참조하는 dependency가 먼저 완료되어 있어야 한다는 것**이다. Interval DP처럼 짧은 구간에 의존한다면 interval length가 작은 순서부터 계산해야 할 수 있다.

Tabulation은 recursion을 사용하지 않아 call-stack depth 문제를 피할 수 있고, memory layout을 순차적으로 접근하기 쉽다. 반면 실제 target에 필요하지 않은 state까지 table 범위에 포함되면 모두 계산할 수 있다.

Memoization과 tabulation은 서로 다른 recurrence를 쓰는 방식이 아니라, 같은 state 관계를 다른 순서로 평가하는 전략일 수 있다. 따라서 어느 방식을 쓸지보다 먼저 state, transition, base와 dependency order가 정확해야 한다.

Bottom-up에서는 impossible state를 정상 초기값과 구분하는 것도 중요하다. 초기화가 잘못되면 recurrence가 아직 도달할 수 없는 state를 유효한 predecessor로 읽을 수 있다.
