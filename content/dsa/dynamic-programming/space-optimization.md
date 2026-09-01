---
kind: concept
contentKey: dsa.core.dynamic-programming.space-optimization
topicContentKey: dsa.core.dynamic-programming
slug: space-optimization
title: "Space Optimization"
summary: "transition이 실제로 참조하는 이전 state만 보존하면서 overwrite 순서와 복원 정보 손실을 관리한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# Space Optimization

### 전체 table이 정말 필요한지 transition부터 본다

DP를 처음 설계할 때는 state를 그대로 table에 보존하는 편이 correctness를 확인하기 쉽다. 하지만 최종 answer를 계산할 때 과거의 모든 state가 필요한 것은 아닐 수 있다.

예를 들어 Fibonacci는:

```text
dp[i] = dp[i-1] + dp[i-2]
```

만 참조한다. `dp[0..i-3]`은 다음 값을 계산하는 데 더 이상 필요하지 않으므로 두 변수만 유지할 수 있다.

```text
prev2 = fib(i-2)
prev1 = fib(i-1)
current = prev1 + prev2
```

공간을 `O(n)`에서 `O(1)`로 줄일 수 있다.

### 2차원 table도 이전 row만 필요할 수 있다

`dp[i][w]`가 오직 `dp[i-1][...]`만 참조한다면 전체 `N×W` table 대신 이전 row와 현재 row 두 개만 유지할 수 있다.

```text
previous[0..W]
current[0..W]
```

한 item 처리가 끝나면 current를 previous로 넘기고 다음 row를 계산한다. 공간은 `O(NW)`에서 `O(W)`로 줄어든다.

### 한 배열로 더 줄일 때 overwrite 문제가 생긴다

Row 두 개를 한 배열로 합치려면 **아직 읽어야 하는 old value를 current iteration이 먼저 덮어쓰지 않는지** 확인해야 한다.

0/1 knapsack에서:

```text
dp[w] = max(dp[w], dp[w-weight] + value)
```

를 사용한다고 하자. Capacity를 작은 값부터 큰 값으로 진행하면 `dp[w-weight]`가 이번 item으로 이미 갱신된 값일 수 있다. 그러면 같은 item을 여러 번 사용하는 결과가 된다.

그래서 0/1 knapsack에서는 보통:

```text
for w = W downTo weight:
```

처럼 역순으로 순회해 current item 이전 단계의 값을 읽도록 한다.

### Loop direction은 문제 constraint를 표현한다

같은 1차원 recurrence라도 unbounded knapsack처럼 item을 여러 번 사용할 수 있다면 정순 순회가 의도에 맞을 수 있다.

따라서 "knapsack은 항상 역순"을 외우는 것이 아니라 **현재 iteration에서 방금 갱신한 값을 다시 사용해도 되는가**를 기준으로 방향을 정해야 한다.

### 값만 남기면 path reconstruction 정보를 잃을 수 있다

DP가 최적 value만 반환하면 rolling array가 충분할 수 있다. 하지만 어떤 item을 골랐는지, 실제 path가 무엇인지 복원해야 한다면 full predecessor table이나 별도 decision metadata가 필요할 수 있다.

예를 들어 knapsack의 최대 value만 `O(W)` 공간으로 계산한 뒤 선택 item 목록까지 요구받으면 값만으로는 과거 decision을 역추적하기 어려울 수 있다.

공간 최적화를 적용하기 전에 output requirement를 확인해야 한다.

### 먼저 correctness, 그 다음 공간을 줄인다

처음부터 복잡한 rolling array와 in-place overwrite를 적용하면 state transition 버그를 찾기 어렵다. 보통은 full table로 작은 입력의 correctness를 확인한 뒤 실제 memory pressure가 의미 있을 때 줄이는 편이 안전하다.

```text
state/transition 확인
→ full table correctness 확인
→ dependency 범위 확인
→ rolling/in-place optimization
→ 동일 test로 결과 비교
```

### 시간까지 자동으로 줄어드는 것은 아니다

Space optimization은 저장하는 state 수를 줄이지만 계산 state 수가 같다면 시간 복잡도는 그대로일 수 있다. `O(NW)` 계산을 하면서 memory만 `O(W)`로 줄이는 경우가 대표적이다.

따라서 memory 개선과 execution-time 개선을 같은 효과로 설명하지 않는다. 어떤 resource를 줄였는지 정확히 구분한다.
