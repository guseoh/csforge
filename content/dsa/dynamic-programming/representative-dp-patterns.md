---
kind: concept
contentKey: dsa.core.dynamic-programming.representative-dp-patterns
topicContentKey: dsa.core.dynamic-programming
slug: representative-dp-patterns
title: "대표 동적 계획법 패턴"
summary: "선형·격자·배낭 문제를 상태와 전이 구조로 바꾸는 기준을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 부분 문제 정의, 메모이제이션, 점화식과 재사용 구조를 확인한다."
    displayOrder: 1
---
# 대표 동적 계획법 패턴

동적 계획법 문제를 선형(sequence), 격자(grid), 배낭(knapsack), 구간(interval) 같은 모양으로 분류하면 상태 후보를 떠올리는 데 도움이 된다. 하지만 패턴 이름보다 중요한 것은 **어떤 정보가 이후 선택과 결과를 결정하고, 어떤 이전 상태에서 현재 상태를 계산하는가**다.

선형 문제에서는 위치나 접두 구간의 길이가 상태 축이 되기 쉽다. 격자에서는 `(row, column)`, 제한 자원이 있는 배낭 문제에서는 `(item index, capacity)`, 구간을 합치는 문제에서는 `(left, right)`가 자연스러운 후보가 된다.

```text
선형 : dp[i]
격자 : dp[r][c]
배낭 : dp[i][w]
구간 : dp[l][r]
```

하지만 같은 입력 모양이라도 제약 조건이 추가되면 상태도 달라질 수 있다. 격자에서 이전 이동 방향이 다음 비용에 영향을 준다면 좌표만으로 충분하지 않고 이동 방향도 상태에 포함해야 한다.

패턴 자체가 정확성을 증명해 주는 것은 아니다. 상태에 필요한 정보가 모두 들어 있는지, 전이가 가능한 선택을 빠짐없이 포함하는지, 기저 상태와 계산 순서가 맞는지, 그리고 `상태 수 × 상태당 전이 비용`이 실제 제약 안에 들어오는지를 각각 확인해야 한다.

대표 패턴의 목적은 문제를 암기하는 것이 아니라 **낯선 문제를 상태와 전이 구조로 바꾸는 출발점**을 제공하는 것이다.
