---
kind: concept
contentKey: dsa.core.dynamic-programming.transition
topicContentKey: dsa.core.dynamic-programming
slug: transition
title: "DP Transition"
summary: "현재 state의 answer를 predecessor state와 가능한 선택으로 계산하는 recurrence를 설계한다."
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

### State의 의미를 식으로 연결한다

DP state를 정의했다면 다음 단계는 현재 state의 answer를 어떤 더 작은 state들로부터 계산할지 정하는 것이다. 이 규칙이 transition, 또는 recurrence다.

Transition은 단순 수식 암기가 아니라 **현재 state에서 가능한 선택을 빠짐없이 나누고, 각 선택 뒤 남는 subproblem을 정확한 predecessor state로 표현하는 과정**이다.

### 0/1 Knapsack transition

다시 다음 state를 사용하자.

```text
dp[i][w]
= 앞의 i개 item을 고려하고 capacity w일 때의 최대 value
```

현재 item i의 weight를 `weight[i]`, value를 `value[i]`라고 하자. 현재 state에서는 두 선택이 있다.

1. item i를 선택하지 않는다.
2. capacity가 충분하다면 item i를 선택한다.

선택하지 않는 경우:

```text
dp[i-1][w]
```

선택하는 경우:

```text
dp[i-1][w-weight[i]] + value[i]
```

따라서:

```text
dp[i][w] = max(
    dp[i-1][w],
    dp[i-1][w-weight[i]] + value[i]
)
```

단, `w < weight[i]`라면 두 번째 선택은 feasible하지 않으므로 사용할 수 없다.

### 왜 `i-1`을 참조하는가

0/1 knapsack에서는 같은 item을 한 번만 사용할 수 있다. Item i를 선택한 뒤 다시 `dp[i][...]`를 참조하면 현재 item을 반복 선택할 수 있는 구조가 될 수 있다.

그래서 transition이 이전 item까지 고려한 `i-1` state를 사용한다. 이 작은 index 차이가 **0/1 선택 invariant**를 표현한다.

Unbounded knapsack처럼 같은 item을 여러 번 사용할 수 있는 문제라면 transition 구조가 달라질 수 있다. 문제 constraint가 recurrence에 직접 들어가는 예다.

### 모든 가능한 선택을 포함해야 한다

Maximization 문제에서 한 branch를 누락하면 그 branch를 통해서만 얻을 수 있는 optimal solution을 놓친다.

예를 들어 "현재 item을 무조건 선택"하는 transition만 쓰면 선택하지 않는 것이 더 좋은 경우를 표현하지 못한다. 반대로 item을 선택하는 branch를 빼면 knapsack을 풀 이유가 없다.

Transition을 만들 때는 현재 state에서 가능한 action을 먼저 열거하고, 각 action이 어느 predecessor state로 이어지는지 대응시키는 것이 안전하다.

### Impossible state를 정상 값과 섞지 않는다

최소 비용 문제에서 불가능한 state를 0으로 두면 `min()`이 그 값을 가장 좋은 후보로 고를 수 있다. 최대화 문제에서도 불가능 state를 큰 양수로 잘못 두면 답이 오염된다.

```text
possible predecessor → transition 후보에 포함
impossible predecessor → 후보에서 제외
```

또 `INF + cost`가 integer overflow를 일으키지 않도록 sentinel 연산도 조심해야 한다.

### Transition이 순환하면 계산 순서를 만들기 어렵다

`dp[A]`가 `dp[B]`를 필요로 하고 동시에 `dp[B]`가 아직 계산되지 않은 `dp[A]`를 필요로 한다면 단순 acyclic DP order를 만들 수 없다.

이 경우 state 정의가 부족하거나 문제를 다른 방식으로 모델링해야 할 수 있다. DP dependency를 graph로 보면 base state에서 target state로 이어지는 방향이 cycle 없이 계산 가능해야 memoization/tabulation이 자연스럽다.

### 작은 입력을 손으로 계산한다

Transition correctness는 작은 예제를 직접 table에 채워보는 것이 강력한 검증 방법이다.

예를 들어 item이 `(weight=2,value=3)`, `(weight=3,value=4)`이고 capacity가 5라면 최종 답은 두 item 모두 선택한 7이어야 한다.

Transition을 따라 `dp[2][5]`가 7이 되는지 확인하면 index, capacity 감소, 선택/미선택 branch가 올바른지 빠르게 검증할 수 있다.

### State와 Transition은 함께 설계한다

State가 무엇을 뜻하는지 불명확하면 transition도 불명확하다. 반대로 transition을 써보았는데 필요한 predecessor를 표현할 수 없다면 state에 정보가 부족한 신호다.

그래서 DP 설계는 보통 다음을 오가며 다듬는다.

```text
state 의미 정의
   ↓
가능한 선택 나열
   ↓
transition 작성
   ↓
base/order 확인
   ↓
작은 입력으로 검증
```

수식보다 이 reasoning 과정이 더 중요하다.
