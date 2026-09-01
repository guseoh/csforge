---
kind: concept
contentKey: dsa.core.dynamic-programming.state-definition
topicContentKey: dsa.core.dynamic-programming
slug: state-definition
title: "DP State Definition"
summary: "future decision과 answer를 결정하는 최소 정보를 subproblem state로 정의한다."
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

### DP에서 가장 먼저 정해야 하는 것은 table 크기가 아니다

Dynamic Programming 문제를 풀 때 흔히 `dp[]`나 `dp[][]` 배열부터 만들지만, 실제로 먼저 결정해야 하는 것은 **각 cell이 정확히 어떤 subproblem의 답을 의미하는가**다. 이것이 DP state definition이다.

좋은 state는 그 state만 알면 앞으로 가능한 선택과 최종 answer를 결정할 수 있을 만큼 충분한 정보를 담는다. 동시에 미래 결과에 영향을 주지 않는 과거 정보는 제거해 distinct state 수를 줄인다.

### 0/1 Knapsack에서 state를 정의해보자

Item마다 weight와 value가 있고 각 item을 최대 한 번 선택할 수 있다고 하자. Capacity W 안에서 value 합을 최대화하는 문제다.

대표적인 state는 다음과 같이 정의할 수 있다.

```text
dp[i][w]
= 앞의 i개 item만 고려했을 때
  capacity w 안에서 얻을 수 있는 최대 value
```

여기서 `i`가 필요한 이유는 어떤 item까지 선택 후보에 포함됐는지를 알아야 하기 때문이다. `w`가 필요한 이유는 남은 선택 가능성이 capacity에 따라 달라지기 때문이다.

### State가 너무 작으면 서로 다른 문제를 합쳐버린다

만약 `dp[i]`만 두고 capacity 정보를 버린다고 하자.

```text
state A: i=4, capacity=10
state B: i=4, capacity=2
```

같은 i라도 선택 가능한 item이 완전히 다르므로 두 state의 optimal answer는 다를 수 있다. 이를 하나의 `dp[4]`로 합치면 어떤 값을 저장해도 둘 중 하나에는 틀린 답이 된다.

이것이 state에 **future decision을 결정하는 정보가 빠지면 안 되는 이유**다.

### State가 너무 크면 재사용할 수 있는 문제가 줄어든다

반대로 결과에 필요 없는 전체 선택 history를 모두 state에 넣는 것도 문제다.

```text
(index, capacity, 지금까지 선택한 모든 item sequence)
```

앞으로의 최적 결과가 index와 remaining capacity만으로 결정되는데 과거 sequence까지 포함하면 사실상 거의 모든 recursion path가 다른 state가 된다. Overlapping subproblem을 하나로 합치지 못해 memoization 효과가 줄어든다.

### State는 문장으로 먼저 정의한다

`dp[i][j]`라는 기호만 보면 i와 j의 의미를 잊기 쉽다. Transition을 작성하기 전에 다음처럼 한 문장으로 고정하는 습관이 좋다.

```text
"dp[i][w]는 앞의 i개 item을 고려하고 capacity가 w일 때의 최대 value다."
```

이 문장이 있으면 다음 질문에 답하기 쉬워진다.

- base state는 무엇인가?
- 어떤 predecessor state가 필요한가?
- 최종 answer는 어느 cell인가?
- loop 순서는 어떻게 되어야 하는가?
- space optimization 때 무엇을 보존해야 하는가?

### State count가 complexity를 만든다

`i`가 `0..N`, `w`가 `0..W`라면 가능한 state 수는 대략 `N×W`다. 각 state에서 O(1)개의 transition을 검사한다면 시간도 `O(NW)`, 전체 table을 저장하면 공간도 `O(NW)` 수준이다.

따라서 state variable 하나를 추가하는 것은 단순 코드 필드 하나를 늘리는 일이 아니다. 가능한 범위 크기만큼 state space가 곱해진다.

### State를 설계할 때 체크할 기준

다음 질문이 유용하다.

```text
이 state가 같다면 앞으로 가능한 선택도 정말 같은가?
이 변수를 빼도 answer가 항상 같은가?
이 변수 범위는 얼마인가?
서로 다른 recursion path가 같은 state로 합쳐지는가?
```

첫 질문이 false라면 state가 부족하고, 두 번째 질문이 true인 변수가 들어 있다면 불필요하게 큰 state일 가능성이 있다.

### Application state와 DP state는 구분한다

실제 backend 객체에는 사용자 ID, timestamp, trace ID 등 많은 정보가 들어 있을 수 있다. 그렇다고 모두 DP state axis가 되는 것은 아니다. DP answer에 영향을 주는 정보만 subproblem state에 포함해야 한다.

반대로 policy version이나 budget처럼 answer를 실제로 바꾸는 값을 빼놓고 cache를 공유하면 서로 다른 문제의 답을 재사용하게 된다. State definition은 성능 최적화 이전에 correctness 계약이다.
