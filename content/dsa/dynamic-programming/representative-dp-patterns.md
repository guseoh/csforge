---
kind: concept
contentKey: dsa.core.dynamic-programming.representative-dp-patterns
topicContentKey: dsa.core.dynamic-programming
slug: representative-dp-patterns
title: "Representative DP Patterns"
summary: "sequence·grid·knapsack·interval 문제를 이름이 아니라 state와 transition 구조로 분류한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# Representative DP Patterns

### 문제 이름보다 state 구조를 본다

DP 문제를 공부하다 보면 "배낭형", "격자형", "수열형" 같은 이름을 자주 사용한다. 이런 분류는 익숙한 state 후보를 떠올리는 데 도움이 되지만, 문제를 특정 이름에 억지로 맞추는 것이 목표는 아니다.

중요한 것은 **앞으로의 answer를 결정하는 최소 정보가 무엇인지, 그 state가 어떤 predecessor에 의존하는지**다. 같은 격자 입력이라도 이동 규칙과 objective가 다르면 state와 transition도 달라질 수 있다.

### Sequence DP

수열의 prefix나 현재 position까지의 최적값을 다루는 문제에서는 index가 자연스러운 state 축이 된다.

예를 들어 계단을 오를 때 1칸 또는 2칸 이동할 수 있고 경우의 수를 세는 문제라면:

```text
dp[i] = i번째 위치까지 도달하는 경우의 수
dp[i] = dp[i-1] + dp[i-2]
```

처럼 이전 몇 개 state만 필요할 수 있다.

하지만 "마지막에 어떤 값을 골랐는가"가 이후 선택 가능성을 바꾼다면 index만으로 부족하고 추가 state가 필요하다.

### Grid DP

2차원 grid에서 오른쪽·아래로만 이동할 수 있다면 좌표 `(r,c)`가 state가 되기 쉽다.

```text
dp[r][c]
= (r,c)까지의 최소 비용

transition:
min(dp[r-1][c], dp[r][c-1]) + cost[r][c]
```

장애물, 대각선 이동, 방향 전환 비용이 추가되면 단순 좌표만으로는 부족할 수 있다. 예를 들어 이전 이동 방향에 따라 cost가 달라지면 direction도 state에 포함해야 한다.

### Knapsack DP

Item을 순서대로 고려하고 제한 resource가 있는 문제에서는 보통:

```text
(item index, remaining/used capacity)
```

가 state 축이 된다.

0/1인지 unbounded인지에 따라 transition과 1차원 optimization loop 방향이 달라진다. "배낭 문제"라는 이름보다 **같은 item을 다시 사용할 수 있는가**라는 constraint가 더 중요하다.

### Interval DP

연속된 구간을 분할해 최적값을 만드는 문제에서는 `(left,right)`가 state가 될 수 있다.

```text
dp[l][r]
= interval [l,r]의 optimal value
```

Transition이 중간 지점 `k`를 선택해 `[l,k]`, `[k+1,r]`를 합친다면 짧은 interval부터 긴 interval 순으로 계산해야 한다.

이런 문제에서 일반적인 `for i=0..n` 순서로 table을 채우면 dependency가 준비되지 않을 수 있다.

### Pattern은 출발점이지 proof가 아니다

입력 모양이 비슷하다는 이유만으로 같은 state를 복사하면 안 된다. State를 정한 뒤에는 반드시 다음을 확인한다.

- 같은 state라면 future decision도 같은가?
- Transition이 가능한 선택을 모두 포함하는가?
- Base/impossible state가 정확한가?
- Dependency 순서를 만들 수 있는가?
- State count × transition cost가 제한 안에 들어오는가?

Pattern은 이 질문에 대한 후보를 빠르게 떠올리게 할 뿐 correctness를 대신하지 않는다.

### 작은 brute force와 비교한다

새 DP를 설계할 때 작은 입력에서는 완전 탐색 결과와 DP 결과를 비교하는 것이 효과적이다. State나 transition이 잘못되면 작은 counterexample에서 금방 차이가 드러난다.

특히 space optimization까지 적용하기 전에 full DP와 brute-force 결과를 맞추고, 그다음 optimized DP가 같은 결과를 내는지 비교하면 설계 오류와 optimization 오류를 분리할 수 있다.

### DP를 쓸지부터 판단한다

State space가 `N×W`인데 W가 10^12처럼 매우 크다면 올바른 recurrence를 찾았더라도 현실적인 알고리즘이 아닐 수 있다. DP pattern을 발견한 뒤에도 실제 constraint와 memory limit을 확인해야 한다.

이 판단은 다음 Topic인 Practical Algorithm Selection으로 이어진다. 알고리즘의 정답성뿐 아니라 입력 상한과 resource budget 안에서 실행 가능한지도 함께 봐야 한다.
