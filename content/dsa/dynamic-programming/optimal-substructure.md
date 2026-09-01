---
kind: concept
contentKey: dsa.core.dynamic-programming.optimal-substructure
topicContentKey: dsa.core.dynamic-programming
slug: optimal-substructure
title: "Optimal Substructure"
summary: "전체 optimal solution이 적절히 정의한 subproblem의 optimal solution으로 구성되는 조건을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# Optimal Substructure

### 전체 최적해 안의 부분도 최적이어야 하는가

Optimal substructure는 전체 문제의 optimal solution을 적절한 subproblem으로 나눴을 때, 그 안에 각 subproblem의 optimal solution이 포함되는 성질이다. 이 성질이 있어야 이미 계산한 작은 문제의 최적값을 이용해 더 큰 문제의 최적값을 만들 수 있다.

Shortest path를 예로 들어 source `A`에서 target `D`까지의 최단 경로가 다음과 같다고 하자.

```text
A -> B -> C -> D
```

이 경로에서 B→D 부분이 B에서 D까지의 최단 경로가 아니라고 가정해보자. 더 짧은 B→D 경로가 있다면 전체 A→D 경로의 B 이후 부분을 그것으로 바꿔 더 짧은 A→D 경로를 만들 수 있다. 이는 원래 경로가 최단이라는 가정과 모순이다.

이처럼 전체 optimal solution 안의 subsolution을 더 좋은 것으로 교체했을 때 전체도 개선된다면 optimal substructure를 설명할 수 있다.

### 상태를 어떻게 자르느냐에 따라 성질이 달라진다

문제 전체에 optimal substructure가 "있다/없다"라고 단순히 말하기보다, **어떤 state definition 아래에서** 이 성질을 사용할 수 있는지를 보는 것이 중요하다.

예를 들어 어떤 경로 문제에서 "현재 vertex"만 state로 저장했는데 이미 방문한 vertex 집합에 따라 앞으로 가능한 path가 달라진다면 현재 vertex 하나만으로는 같은 subproblem이라고 할 수 없다. 필요한 제약 상태를 누락한 것이다.

즉 subproblem을 잘못 정의하면 optimal substructure를 사용하는 recurrence도 틀릴 수 있다.

### Overlapping subproblems와는 다른 성질이다

Optimal substructure는 **정답을 조립할 수 있는가**에 대한 성질이고, overlapping subproblems는 **같은 계산이 반복되는가**에 대한 성질이다.

```text
Optimal substructure
→ 작은 최적해로 큰 최적해를 만들 수 있는가?

Overlapping subproblems
→ 같은 작은 상태가 여러 경로에서 반복되는가?
```

둘은 같은 개념이 아니다. Merge sort처럼 부분 문제가 겹치지 않아도 divide-and-conquer에서 부분 결과를 조합할 수 있고, 어떤 재귀는 상태가 반복되더라도 단순히 cached value 하나로 전체 optimal result를 만들 수 없는 경우가 있다.

DP에서는 보통 두 성질이 함께 나타날 때 큰 이점을 얻는다.

### 0/1 Knapsack에서 보는 optimal substructure

`dp[i][w]`를 "앞의 i개 item만 고려하고 capacity가 w일 때 얻을 수 있는 최대 value"라고 정의하자.

Item i를 선택하지 않는 최적해는 `dp[i-1][w]`에서 오고, 선택할 수 있다면 선택하는 경우는 `dp[i-1][w-weight[i]] + value[i]`에서 온다.

```text
dp[i][w] = max(
    dp[i-1][w],
    dp[i-1][w-weight[i]] + value[i]
)
```

현재 최적값이 더 작은 subproblem의 최적값을 이용해 만들어진다. 만약 그 subproblem 값이 최적이 아니라면 해당 부분만 더 좋은 solution으로 바꿔 현재 값도 개선할 수 있다.

### Greedy와의 관계

Greedy algorithm도 optimal substructure를 갖는 경우가 많지만 그것만으로 greedy가 되는 것은 아니다. Greedy는 추가로 **현재 local choice를 확정해도 optimal solution을 잃지 않는 greedy-choice property**가 필요하다.

DP는 여러 선택의 결과를 state별로 비교해 최적값을 보존할 수 있으므로 local choice를 일찍 확정하지 않아도 된다.

### 확인해야 할 질문

DP recurrence를 만들기 전에 다음을 물어보면 좋다.

- 현재 state의 optimal answer가 어떤 더 작은 state의 answer로 구성되는가?
- 작은 state가 최적이 아니면 현재 answer도 개선할 수 있는가?
- 현재 state에 필요한 constraint를 빠뜨리지 않았는가?

이 답이 명확해지면 다음 단계인 state와 transition 설계가 훨씬 구체적이 된다.
