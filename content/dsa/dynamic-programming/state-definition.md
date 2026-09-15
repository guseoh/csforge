---
kind: concept
contentKey: dsa.core.dynamic-programming.state-definition
topicContentKey: dsa.core.dynamic-programming
slug: state-definition
title: "DP State Definition"
summary: "state가 표현하는 부분 문제와 충분한 정보를 정확히 정의한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# DP State Definition

DP에서 먼저 정해야 하는 것은 배열 차원이 아니라 **각 state가 어떤 subproblem의 답을 의미하는가**다.

좋은 state는 그 값들만 알면 앞으로 가능한 선택과 answer를 결정할 수 있을 만큼 충분한 정보를 담으면서, 미래 결과에 영향을 주지 않는 과거 정보는 제외한다.

예를 들어 0/1 knapsack에서 다음처럼 정의할 수 있다.

```text
dp[i][w]
= 앞의 i개 item만 고려했을 때
  capacity w에서 얻을 수 있는 최대 value
```

`i`를 빼면 어떤 item이 아직 선택 가능한지 알 수 없고, `w`를 빼면 남은 capacity가 다른 subproblem을 하나로 합치게 된다. 반대로 앞으로의 결과에 필요 없는 전체 선택 history까지 state에 넣으면 distinct state 수만 커지고 중복 계산을 합치기 어렵다.

State는 기호보다 문장으로 먼저 정의하는 것이 좋다. 그 문장이 정해지면 base state, transition, 계산 순서와 최종 answer 위치를 일관되게 설계할 수 있다.

또 state variable의 범위는 complexity와 직접 연결된다. `i=0..N`, `w=0..W`라면 가능한 state 수는 대략 O(NW)다. 따라서 state 하나를 추가하는 것은 메모리와 시간 공간을 함께 확장하는 선택이다.
