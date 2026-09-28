---
kind: concept
contentKey: dsa.core.dynamic-programming.space-optimization
topicContentKey: dsa.core.dynamic-programming
slug: space-optimization
title: "공간 최적화(Space Optimization)"
summary: "필요한 이전 상태만 남겨 메모리를 줄이는 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 부분 문제 정의, 메모이제이션, 점화식과 재사용 구조를 확인한다."
    displayOrder: 1
---
# 공간 최적화(Space Optimization)

DP 테이블 전체가 항상 필요한 것은 아니다. 전이가 실제로 참조하는 과거 상태의 범위를 확인하면 더 이상 필요 없는 값을 버려 메모리를 줄일 수 있다.

피보나치 수는 `dp[i-1]`, `dp[i-2]`만 필요하므로 전체 O(n) 테이블 대신 두 이전 값만 유지해 O(1) 공간으로 계산할 수 있다.

2차원 DP도 현재 행이 이전 행에만 의존한다면 두 행만 유지해 O(NW) 공간을 O(W)로 줄일 수 있다. 한 배열로 더 줄일 때는 현재 반복에서 갱신한 값이 아직 읽어야 하는 이전 상태를 덮어쓰지 않는지 확인해야 한다.

0/1 배낭 문제의 1차원 DP에서 용량을 역순으로 도는 이유가 여기에 있다. 같은 물건으로 방금 갱신한 상태를 다시 읽으면 그 물건을 여러 번 사용하는 문제로 바뀔 수 있다.

공간을 줄이면 과거 선택 정보도 사라질 수 있다. 최적값뿐 아니라 실제 선택 경로를 복원해야 한다면 이전 상태나 선택 메타데이터를 별도로 보존해야 할 수 있다.

따라서 공간 최적화는 **전이의 의존 관계를 유지하면서 저장하는 상태 수만 줄이는 것**이다. 계산하는 상태 수가 같다면 시간 복잡도가 자동으로 줄어드는 것은 아니다.
