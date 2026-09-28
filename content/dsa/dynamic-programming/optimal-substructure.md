---
kind: concept
contentKey: dsa.core.dynamic-programming.optimal-substructure
topicContentKey: dsa.core.dynamic-programming
slug: optimal-substructure
title: "최적 부분 구조(Optimal Substructure)"
summary: "전체 최적해가 부분 문제의 최적해로 구성될 수 있는 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 부분 문제 정의, 메모이제이션, 점화식과 재사용 구조를 확인한다."
    displayOrder: 1
---
# 최적 부분 구조(Optimal Substructure)

최적 부분 구조는 전체 문제의 최적해를 적절한 부분 문제로 나눴을 때 **전체 최적해 안에 각 부분 문제의 최적해를 사용할 수 있는 성질**이다. 이 성질이 있어야 작은 상태에서 구한 최적값을 이용해 더 큰 상태의 최적값을 구성할 수 있다.

예를 들어 A에서 D까지의 최단 경로가 A→B→C→D라고 하자. 만약 B에서 D까지 이 경로보다 더 짧은 경로가 존재한다면 B→D 구간을 더 짧은 경로로 바꿔 A→D 전체 경로도 줄일 수 있다. 이는 처음 경로가 최단이었다는 가정과 모순된다.

중요한 것은 **어떤 상태 정의 아래에서 이 성질이 성립하는가**다. 앞으로 가능한 선택이 과거의 추가 정보에 따라 달라지는데 상태에서 그 정보를 빠뜨리면 실제로는 서로 다른 부분 문제를 같은 문제로 취급하게 된다.

최적 부분 구조와 중복 부분 문제(overlapping subproblems)는 서로 다른 성질이다. 최적 부분 구조는 작은 문제의 최적해로 큰 문제의 최적해를 구성할 수 있는지를 보고, 중복 부분 문제는 같은 상태가 여러 계산 경로에서 반복되는지를 본다.

동적 계획법에서는 보통 이 두 성질을 함께 이용한다. 상태를 정확하게 정의해야 점화식이 작은 문제의 결과를 안전하게 재사용할 수 있다.
