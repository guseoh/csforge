---
kind: concept
contentKey: dsa.core.dynamic-programming.initialization-order
topicContentKey: dsa.core.dynamic-programming
slug: initialization-order
title: "Initialization and Order"
summary: "base·impossible state와 dependency 순서를 정확히 잡아 recurrence가 올바른 값을 읽게 한다."
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

### Transition이 맞아도 초기값과 계산 순서가 틀리면 오답이다

DP에서는 recurrence만 맞추고도 결과가 틀리는 경우가 많다. 현재 state가 참조하는 predecessor가 어떤 초기값을 가지고 있는지, 그 predecessor가 실제로 먼저 계산되었는지가 correctness의 일부이기 때문이다.

따라서 DP를 구현할 때는 transition과 함께 **base state, impossible state, computation order**를 설계해야 한다.

### Base state는 문제의 시작점을 의미한다

0/1 knapsack에서 `dp[i][w]`를 앞의 i개 item으로 capacity w에서 얻는 최대 value라고 정의했다면 item을 하나도 고려하지 않은 상태는 다음과 같다.

```text
dp[0][w] = 0
```

아무 item도 선택할 수 없으므로 capacity가 얼마든 최대 value는 0이다.

반면 최소 coin 개수처럼 "금액 x를 만들기 위한 최소 개수" 문제에서는:

```text
dp[0] = 0
```

은 자연스럽지만 아직 만들 수 없는 금액을 모두 0으로 두면 안 된다.

### Impossible state와 정상 0을 구분한다

Minimization 문제에서 불가능한 state를 0으로 초기화하면 0이 가장 작은 값이기 때문에 `min()`이 그 state를 최적 후보로 선택한다.

예를 들어 coin `[3]`만 있는데 금액 1을 만드는 state는 불가능하다.

```text
dp[0] = 0
dp[1] = INF
dp[2] = INF
dp[3] = 1
```

`INF` 같은 sentinel은 "아직 유효한 solution이 없음"을 뜻한다. 실제 비용 0과 의미가 다르다.

### Sentinel 연산에도 주의한다

`INF`를 매우 큰 integer로 잡았다면 다음 연산이 overflow되지 않는지 확인해야 한다.

```text
INF + cost
```

실제로 reachable한 predecessor에서만 transition을 적용하거나 overflow-safe sentinel을 사용하는 편이 안전하다.

### 계산 순서는 dependency graph에서 나온다

Fibonacci transition이 `dp[i-1]`, `dp[i-2]`를 참조한다면 작은 i에서 큰 i로 계산해야 한다.

Interval DP처럼 `dp[l][r]`가 더 짧은 subinterval에 의존한다면 interval length가 작은 순서부터 진행할 수 있다.

```text
length = 1
length = 2
length = 3
...
```

즉 loop 순서는 배열 index의 편의가 아니라 **predecessor가 먼저 준비되도록 하는 topological order**다.

### 0/1 Knapsack의 1차원 order가 중요한 이유

2차원 `dp[i][w]`를 1차원 `dp[w]`로 줄일 때는 current item을 한 번만 사용해야 한다. Capacity를 작은 값에서 큰 값으로 순회하면 이번 item으로 방금 갱신한 `dp[w-weight]`를 같은 iteration에서 다시 읽을 수 있다.

```text
정순: 0 → W
→ current item 재사용 가능
```

0/1 knapsack에서는 일반적으로 큰 capacity에서 작은 capacity로 내려간다.

```text
역순: W → weight[i]
→ 이전 item 단계 값만 사용
```

이 loop 방향 하나가 "같은 item 최대 한 번"이라는 문제 constraint를 구현한다.

### Answer 위치도 state 정의에서 나온다

Table을 모두 채운 뒤 무조건 마지막 cell을 반환하면 안 된다. State가 "정확히 capacity w를 사용한 값"인지 "capacity w 이하에서 가능한 값"인지에 따라 answer 위치가 달라질 수 있다.

Base, order, answer extraction은 모두 state 문장과 transition에서 파생되어야 한다.

### 작은 table trace가 가장 빠른 검증 도구다

DP 구현이 의심스러우면 작은 입력을 선택해 각 cell을 손으로 채워본다. 2~3개 item, 작은 capacity처럼 전체 state를 눈으로 볼 수 있는 입력이 좋다.

이 과정에서 다음 오류를 쉽게 발견할 수 있다.

- base state가 잘못됨
- impossible state가 정상 값으로 섞임
- loop 방향 때문에 current state를 다시 읽음
- answer cell을 잘못 선택함

DP의 많은 버그는 복잡한 수학보다 table state의 의미가 흐려져서 생긴다.
