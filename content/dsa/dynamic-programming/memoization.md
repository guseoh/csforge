---
kind: concept
contentKey: dsa.core.dynamic-programming.memoization
topicContentKey: dsa.core.dynamic-programming
slug: memoization
title: "메모이제이션(Memoization)"
summary: "하향식 재귀 결과를 저장해 같은 상태의 중복 계산을 줄인다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 부분 문제 정의, 메모이제이션, 점화식과 재사용 구조를 확인한다."
    displayOrder: 1
---
# 메모이제이션(Memoization)

메모이제이션은 하향식 재귀를 유지하면서 어떤 상태의 결과를 처음 계산한 뒤 저장하고, 같은 상태가 다시 요청되면 저장된 값을 반환하는 방법이다.

```text
solve(state):
    if memo에 state가 있으면
        return memo[state]

    result = subproblem 계산
    memo[state] = result
    return result
```

핵심은 저장 결과를 찾는 키가 동적 계획법의 상태 정의와 정확히 같아야 한다는 것이다. 답이 `(index, capacity)` 두 변수에 의존하는데 인덱스만 키로 사용하면 서로 다른 부분 문제의 결과를 잘못 재사용한다.

메모이제이션의 시간 복잡도는 단순히 "재귀 결과를 저장했으니 O(n)"이라고 말할 수 없다. 보통 **서로 다른 상태 수 × 상태 하나를 계산할 때 검사하는 전이 비용**으로 분석한다.

또 실제 결과가 0이나 `false`일 수 있으므로 아직 계산하지 않은 상태와 정상 결과를 구분해야 한다. 별도의 방문 여부나 정상 결과와 겹치지 않는 센티널(sentinel)을 사용해 `UNCOMPUTED`와 계산 완료 값을 혼동하지 않는다.

하향식 방식은 목표 상태에서 실제로 도달하는 상태만 계산할 수 있다는 장점이 있지만 재귀 깊이가 깊어질 수 있다. 같은 점화식을 상향식으로 계산하는 테이블 방식과 이 상충 관계를 비교할 수 있다.
