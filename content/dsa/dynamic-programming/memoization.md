---
kind: concept
contentKey: dsa.core.dynamic-programming.memoization
topicContentKey: dsa.core.dynamic-programming
slug: memoization
title: "Memoization"
summary: "top-down recursion에서 계산한 state 결과를 저장해 동일 subproblem의 재계산을 제거한다."
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

### 재귀 구조를 유지하면서 같은 state를 한 번만 계산한다

Memoization은 top-down recursion을 그대로 사용하되, 어떤 state의 결과를 처음 계산한 뒤 저장하고 같은 state가 다시 요청되면 저장된 값을 반환하는 방식이다.

Fibonacci를 단순 재귀로 작성하면 `fib(3)`, `fib(2)`가 여러 번 다시 계산된다.

```text
fib(5)
├─ fib(4)
│  ├─ fib(3)
│  └─ fib(2)
└─ fib(3)   // 반복
```

Memoization을 사용하면 다음 흐름이 된다.

```text
solve(state):
    if state가 cache에 있으면
        return cache[state]

    result = subproblem 계산
    cache[state] = result
    return result
```

`fib(3)`을 한 번 계산한 뒤에는 다른 호출 경로에서 다시 recursion tree를 펼치지 않는다.

### 시간 복잡도는 distinct state 수와 state당 transition 비용으로 본다

Memoization을 적용했다고 무조건 O(n)이 되는 것은 아니다. 중요한 것은 가능한 distinct state가 몇 개인지와 각 state를 계산할 때 몇 개의 transition을 검사하는지다.

예를 들어 state가 `dp[i][w]`처럼 item index와 capacity 두 변수로 구성된다면 대략 `N × W`개의 state가 존재할 수 있다. 각 state에서 선택/미선택 두 transition만 본다면 전체 계산량을 `O(NW)` 수준으로 분석할 수 있다.

```text
총 비용 ≈ distinct states × state당 transition cost
```

DP complexity를 분석할 때 매우 유용한 관점이다.

### Cache key는 state definition과 같아야 한다

`solve(index, remainingCapacity)`의 답이 두 변수 모두에 의존하는데 memo key를 `index`만 사용하면 잘못된 결과를 재사용한다.

```text
solve(3, 10) != solve(3, 2)
```

이 둘을 같은 key로 저장하면 첫 번째 계산 결과가 두 번째 상태에 섞인다. Memoization cache는 단순 성능 cache가 아니라 **DP correctness state를 저장하는 table**이므로 key 누락은 오답으로 직결된다.

### 미계산 상태와 계산 결과를 구분한다

DP 결과로 0, false, 빈 문자열 같은 값이 정상적으로 나올 수 있다면 default value만 보고 "아직 계산하지 않았다"고 판단하면 안 된다.

예를 들어 최대 value가 실제로 0일 수 있는 문제에서 `memo[state] == 0`을 cache miss 신호로 쓰면 정상적으로 계산한 0을 계속 다시 계산할 수 있다.

별도의 visited flag, nullable wrapper, sentinel 등으로 `UNCOMPUTED`와 실제 결과를 구분한다.

### Top-down의 장점: 필요한 state만 계산한다

Memoization은 target에서 출발해 실제로 도달하는 state만 계산한다. 전체 state space는 크지만 특정 입력에서 일부 state만 reachable하다면 bottom-up으로 모든 table cell을 채우는 것보다 계산량을 줄일 수 있다.

반대로 recursion depth가 매우 깊다면 call stack 비용이나 stack overflow 위험이 생길 수 있다. 이 경우 같은 recurrence를 tabulation으로 바꾸는 것이 더 안전할 수 있다.

### 순환 dependency는 별도 문제다

DP dependency graph는 일반적으로 state가 더 작은 state에 의존하는 acyclic 구조여야 계산 순서를 만들 수 있다. `solve(A)` 계산 중 다시 아직 계산 중인 `solve(A)`에 돌아온다면 단순 cache miss로 재귀를 계속하면 무한 recursion이 발생할 수 있다.

필요한 문제에서는 `UNCOMPUTED / COMPUTING / DONE`처럼 상태를 나눠 dependency cycle을 감지한다. 다만 모든 recursive cycle을 DP로 해결할 수 있다는 뜻은 아니며 recurrence 자체를 다시 설계해야 할 수도 있다.

### 일반 application cache와 구분한다

Memoization은 수학적으로 동일한 subproblem의 결과를 같은 계산 안에서 재사용하는 DP 기법이다. Backend의 장기 cache는 version, invalidation, concurrency, memory limit 같은 별도 운영 문제를 가진다.

두 경우 모두 key-value 저장을 사용할 수 있지만 correctness boundary와 lifetime은 다르다. DP memo를 Redis 같은 외부 cache로 옮긴다고 자동으로 더 좋은 설계가 되는 것도 아니다.
