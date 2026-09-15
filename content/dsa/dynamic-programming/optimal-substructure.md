---
kind: concept
contentKey: dsa.core.dynamic-programming.optimal-substructure
topicContentKey: dsa.core.dynamic-programming
slug: optimal-substructure
title: "Optimal Substructure"
summary: "전체 최적해가 부분 최적해로 구성되는 조건을 설명한다."
level: 2
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

Optimal substructure는 전체 문제의 optimal solution을 적절한 subproblem으로 나눴을 때, 그 안에 각 subproblem의 optimal solution이 포함되는 성질이다. 이 성질이 있어야 작은 state의 최적값을 이용해 더 큰 state의 최적값을 만들 수 있다.

예를 들어 shortest path의 일부 구간이 그 구간 자체의 최단 경로가 아니라면, 그 부분을 더 짧은 경로로 바꿔 전체 경로도 더 짧게 만들 수 있다. 이는 원래 전체 경로가 최단이라는 가정과 모순이다.

중요한 것은 **어떤 state definition 아래에서** 이 성질이 성립하는지다. 앞으로 가능한 선택이 과거의 추가 정보에 따라 달라지는데 state에서 그 정보를 빠뜨리면 서로 다른 subproblem을 하나로 합치게 된다.

Optimal substructure와 overlapping subproblems는 다른 성질이다. 전자는 작은 최적해로 큰 최적해를 만들 수 있는가를, 후자는 같은 작은 state가 반복되는가를 묻는다.

DP에서는 보통 이 두 성질을 함께 이용한다. State가 올바르게 정의되어야 recurrence가 작은 optimal answer를 안전하게 재사용할 수 있다.
