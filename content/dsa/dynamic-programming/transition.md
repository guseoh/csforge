---
kind: concept
contentKey: dsa.core.dynamic-programming.transition
topicContentKey: dsa.core.dynamic-programming
slug: transition
title: "동적 계획법 전이(DP Transition)"
summary: "이전 상태에서 현재 상태의 답을 만드는 전이 규칙을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 부분 문제 정의, 메모이제이션, 점화식과 재사용 구조를 확인한다."
    displayOrder: 1
---
# 동적 계획법 전이(DP Transition)

전이는 현재 DP 상태의 답을 **어떤 더 작은 상태와 선택으로부터 계산할지 정의하는 규칙**이다. 핵심은 현재 상태에서 가능한 선택을 빠짐없이 나누고, 각 선택 뒤 남는 문제를 올바른 이전 상태로 표현하는 것이다.

예를 들어 0/1 배낭 문제에서 상태를 다음과 같이 정의했다고 하자.

```text
dp[i][w]
= 앞의 i개 물건을 고려하고 용량 w일 때 얻을 수 있는 최대 가치
```

그러면 i번째 물건을 선택하지 않는 경우와 선택하는 경우를 비교할 수 있다.

```text
dp[i][w] = max(
    dp[i-1][w],
    dp[i-1][w-weight[i]] + value[i]
)
```

두 번째 경우는 현재 용량이 i번째 물건의 가중치 이상일 때만 유효하다. 또 `i-1` 상태를 참조하므로 **같은 물건을 한 번만 선택한다는 0/1 제약**이 점화식에 반영된다.

가능한 선택 분기를 누락하면 그 분기를 통해서만 얻을 수 있는 최적해를 놓친다. 반대로 실제로 도달할 수 없는 이전 상태를 정상 후보로 포함하면 존재하지 않는 경로가 정답 계산에 섞일 수 있다.

상태와 전이는 서로 맞물린다. 필요한 이전 정보를 현재 상태로 표현할 수 없다면 상태 정의가 부족하다는 신호다. 반대로 상태의 의미가 불명확하면 어떤 이전 상태를 참조해야 하는지도 정할 수 없어 점화식을 올바르게 만들기 어렵다.
