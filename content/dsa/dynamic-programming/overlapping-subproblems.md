---
kind: concept
contentKey: dsa.core.dynamic-programming.overlapping-subproblems
topicContentKey: dsa.core.dynamic-programming
slug: overlapping-subproblems
title: "Overlapping Subproblems"
summary: "서로 다른 재귀 경로가 같은 subproblem state를 반복 계산하는 구조와 재사용 가치를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# Overlapping Subproblems

### 같은 문제를 여러 번 다시 푸는 재귀

Dynamic Programming이 효과를 내는 대표적인 신호는 서로 다른 호출 경로가 **동일한 subproblem을 반복해서 계산하는 것**이다. 이를 overlapping subproblems라고 한다.

가장 단순한 예는 Fibonacci 재귀다.

```text
fib(5)
├─ fib(4)
│  ├─ fib(3)
│  │  ├─ fib(2)
│  │  └─ fib(1)
│  └─ fib(2)
└─ fib(3)
   ├─ fib(2)
   └─ fib(1)
```

`fib(3)`, `fib(2)` 같은 동일한 입력이 여러 branch에서 반복된다. 단순 재귀는 각 등장 때마다 그 아래 호출을 다시 수행하므로 호출 tree가 빠르게 커진다.

### Subproblem은 입력 값이 아니라 상태다

"같은 문제"라는 말은 함수 이름이 같다는 뜻이 아니다. 이후 답을 결정하는 **state가 동일해야 같은 subproblem**이다.

예를 들어 0/1 knapsack에서 다음 두 호출을 생각해보자.

```text
solve(index=4, remainingCapacity=10)
solve(index=4, remainingCapacity=3)
```

처리할 item index는 같지만 남은 capacity가 다르므로 앞으로 가능한 선택과 답이 다르다. 두 호출을 같은 state로 취급하면 오답이다.

반대로 서로 다른 재귀 경로에서 `(index=4, capacity=10)`이 다시 나타난다면 동일한 결과를 재사용할 수 있다.

### 반복 계산을 저장하면 search tree가 state graph로 줄어든다

Memoization은 어떤 state를 처음 계산했을 때 결과를 저장하고, 같은 state를 다시 만나면 재귀를 다시 펼치지 않고 저장된 값을 반환한다.

Fibonacci에서 `fib(k)`의 가능한 state는 `0..n` 정도뿐이다. 단순 재귀 호출 수는 지수적으로 늘 수 있지만 memoization을 사용하면 각 `k`를 한 번만 실제 계산하므로 상태 수에 비례한 계산으로 줄어든다.

```text
호출 경로는 많아도
실제 distinct state는 적을 수 있다.
```

DP의 핵심은 이 차이를 발견하는 것이다.

### Divide and Conquer와의 차이

Merge sort의 왼쪽 절반과 오른쪽 절반처럼 부분 문제가 서로 겹치지 않는다면 결과를 memoize해도 같은 subproblem을 다시 만나는 일이 거의 없다. 이런 경우는 divide-and-conquer가 자연스럽다.

DP는 보통 **부분 문제를 나눴을 때 동일 state가 여러 경로에서 재등장하는 구조**에서 가치가 커진다.

### State key가 부족하면 잘못된 재사용이 일어난다

Memo key에 실제 답을 결정하는 변수를 모두 포함하지 않으면 서로 다른 subproblem을 같은 것으로 오인한다.

예를 들어 `solve(index, capacity)`를 계산하면서 cache key를 `index`만 사용하면 capacity 3의 결과를 capacity 10에서 재사용할 수 있다. 실행은 빨라져도 결과는 틀린다.

따라서 overlapping 여부를 판단하기 전에 먼저 "어떤 값들이 동일해야 앞으로의 선택과 답도 동일한가?"를 정의해야 한다. 이 질문이 뒤의 DP State Definition으로 이어진다.

### 모든 재귀에 DP를 붙일 필요는 없다

Subproblem이 거의 반복되지 않거나 state space 자체가 너무 크다면 memoization table의 memory 비용만 늘어날 수 있다. DP를 선택할 때는 재귀가 있다는 사실보다 **distinct state 수와 반복 횟수**를 보는 것이 중요하다.
