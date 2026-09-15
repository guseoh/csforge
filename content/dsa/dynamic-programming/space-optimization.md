---
kind: concept
contentKey: dsa.core.dynamic-programming.space-optimization
topicContentKey: dsa.core.dynamic-programming
slug: space-optimization
title: "Space Optimization"
summary: "필요한 이전 state만 남겨 메모리를 줄이는 조건을 설명한다."
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

DP table 전체가 항상 필요한 것은 아니다. Transition이 실제로 참조하는 과거 state 범위를 확인하면 더 이상 필요 없는 값을 버려 메모리를 줄일 수 있다.

Fibonacci는 `dp[i-1]`, `dp[i-2]`만 필요하므로 전체 O(n) table 대신 두 이전 값만 유지해 O(1) 공간으로 계산할 수 있다.

2차원 DP도 현재 row가 이전 row에만 의존한다면 두 row만 유지해 O(NW) 공간을 O(W)로 줄일 수 있다. 한 배열로 더 줄일 때는 현재 iteration에서 갱신한 값이 아직 읽어야 하는 이전 state를 덮어쓰지 않는지 확인해야 한다.

0/1 knapsack의 1차원 DP에서 capacity를 역순으로 도는 이유가 여기에 있다. 같은 item으로 방금 갱신한 state를 다시 읽으면 그 item을 여러 번 사용하는 문제로 바뀔 수 있다.

공간을 줄이면 과거 decision 정보도 사라질 수 있다. 최적 value뿐 아니라 실제 선택 path를 복원해야 한다면 predecessor나 decision metadata를 별도로 보존해야 할 수 있다.

따라서 space optimization은 **transition dependency를 유지하면서 저장 state만 줄이는 것**이다. 계산 state 수가 같다면 시간 복잡도가 자동으로 줄어드는 것은 아니다.
