---
kind: concept
contentKey: dsa.core.dynamic-programming.tabulation
topicContentKey: dsa.core.dynamic-programming
slug: tabulation
title: "Tabulation"
summary: "base state에서 시작해 dependency가 해결된 순서로 DP table을 bottom-up 계산한다."
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

### 재귀 호출 대신 작은 state부터 table을 채운다

Tabulation은 memoization과 같은 subproblem 관계를 사용할 수 있지만 계산 방향이 다르다. Memoization이 target state에서 필요한 subproblem을 재귀적으로 요청하는 top-down 방식이라면, tabulation은 base state를 먼저 채우고 그 결과를 이용해 더 큰 state를 계산하는 bottom-up 방식이다.

Fibonacci를 예로 들면 다음처럼 진행할 수 있다.

```text
dp[0] = 0
dp[1] = 1

for i = 2..n:
    dp[i] = dp[i-1] + dp[i-2]
```

`dp[i]`를 계산할 시점에 필요한 `dp[i-1]`, `dp[i-2]`가 이미 준비되어 있다. 이 **dependency order**가 tabulation correctness의 핵심이다.

### 순서는 recurrence에서 나온다

Loop 방향은 단순 구현 취향이 아니다. Transition이 어떤 predecessor state를 참조하는지에 따라 계산 순서가 결정된다.

```text
dp[i] <- dp[i-1], dp[i-2]
```

이라면 작은 i에서 큰 i로 진행한다. 반대로 어떤 interval DP에서는 짧은 구간을 먼저 계산한 뒤 긴 구간을 계산해야 할 수 있다.

따라서 table을 만들고 무조건 왼쪽 위부터 채우는 것이 DP가 아니다. **각 state가 참조하는 state가 먼저 완료되도록 topological order를 만드는 것**이 본질이다.

### 0/1 Knapsack의 2차원 table

`dp[i][w]`를 앞의 i개 item으로 capacity w에서 얻을 수 있는 최대 value라고 정의하면 다음과 같은 순서를 만들 수 있다.

```text
for i = 1..N:
    for w = 0..W:
        dp[i][w] = ... dp[i-1][...]
```

현재 row `i`는 이전 row `i-1`만 참조하므로 `i-1` row를 모두 계산한 뒤 `i`로 넘어가면 dependency가 안전하다.

### 필요한 state를 모두 계산할 수도 있다

Tabulation은 구현이 반복문 중심이라 recursion depth 문제가 없고 memory layout이 연속적이면 locality에도 유리할 수 있다. 반면 target까지 실제로 도달하지 않는 state도 table 범위에 포함되면 모두 계산할 수 있다.

Memoization은 reachable state만 demand-driven으로 계산하는 장점이 있고, tabulation은 계산 순서와 memory 사용을 명확하게 통제하기 쉽다는 장점이 있다.

### Base state와 impossible state

Bottom-up 방식은 table을 먼저 만들기 때문에 초기값 실수가 특히 위험하다. 최소화 문제에서 모든 cell을 0으로 두면 도달하지 못한 state까지 비용 0인 정상 state로 오인할 수 있다.

```text
base state = 실제 문제에서 출발 가능한 상태
impossible state = INF 또는 별도 sentinel
```

초기화는 recurrence보다 먼저 설계해야 한다.

### Answer 위치도 명확히 해야 한다

Table을 모두 채운다고 최종 answer가 항상 마지막 cell에 있는 것은 아니다. `dp[N][W]`일 수도 있고 마지막 row의 최댓값일 수도 있으며 여러 end state를 비교해야 할 수도 있다.

State definition 단계에서 `dp[...]`가 무엇을 의미하는지 문장으로 적으면 마지막 answer를 어디에서 읽어야 하는지도 자연스럽게 정해진다.

### Memoization과 Tabulation은 다른 알고리즘이 아닐 수 있다

두 방식은 같은 recurrence를 서로 다른 order로 계산하는 구현 전략일 수 있다. 문제의 핵심은 "memoization을 쓸까 tabulation을 쓸까"보다 먼저 **subproblem, state, transition이 정확한가**다.

그 설계가 맞은 뒤 recursion depth, reachable state 비율, memory locality, 구현 복잡도를 보고 실행 방식을 선택한다.
