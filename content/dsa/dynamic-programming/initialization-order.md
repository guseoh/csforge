---
kind: concept
contentKey: dsa.core.dynamic-programming.initialization-order
topicContentKey: dsa.core.dynamic-programming
slug: initialization-order
title: "초기화와 계산 순서"
summary: "기저값과 계산 순서가 잘못될 때 생기는 오류를 분석한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 부분 문제 정의, 메모이제이션, 점화식과 재사용 구조를 확인한다."
    displayOrder: 1
---
# 초기화와 계산 순서

동적 계획법에서는 전이가 맞아도 기저 상태와 계산 순서가 잘못되면 오답이 된다. 현재 상태가 참조하는 이전 상태가 **올바른 초기값을 가지고 있고 이미 계산되어 있어야** 하기 때문이다.

기저 상태는 문제의 가장 작은 정상 부분 문제를 나타낸다. 도달할 수 없는 상태는 정상 값과 구분해야 한다. 예를 들어 최소화 문제에서 도달 불가능한 상태를 0으로 두면 `min()`이 그 값을 가장 좋은 후보로 선택할 수 있으므로 무한대 값이나 별도의 센티널이 필요하다.

계산 순서는 상태 사이의 의존 관계에서 결정된다. `dp[i]`가 `dp[i-1]`, `dp[i-2]`에 의존하면 작은 `i`부터 계산해야 한다. 구간 DP처럼 짧은 구간의 값에 의존한다면 구간 길이가 작은 순서부터 진행해야 한다.

공간 최적화를 위해 하나의 배열을 덮어쓸 때는 계산 순서가 문제의 제약 조건을 직접 표현하기도 한다. 0/1 배낭 문제의 1차원 DP는 같은 물건을 같은 반복에서 다시 사용하지 않도록 용량을 큰 값에서 작은 값으로 순회한다.

용량 4인 0/1 배낭에서 **무게 2, 가치 3인 물건 하나**만 처리한다고 하자. 처음에는 `dp[0..4]=[0,0,0,0,0]`이다. 용량을 작은 쪽부터 갱신하면 `dp[2]=3` 직후 같은 물건에서 이미 갱신한 `dp[2]`를 읽어 `dp[4]=6`이 된다. 한 물건을 두 번 고른 잘못된 상태다. 큰 용량부터 갱신하면 `dp[4]=max(0, 이전 dp[2]+3)=3`을 먼저 계산하므로 한 번만 선택한다. **계산 순서가 어느 시점의 상태를 참조하는지**를 결정한다.

```text
순방향 2→4: dp[2]=3 → dp[4]=6 (동일 물건 재사용, 오답)
역방향 4→2: dp[4]=3 → dp[2]=3 (이전 상태 참조, 정답)
```

따라서 초기화와 반복 순서는 구현 편의가 아니라 **점화식이 올바른 이전 상태를 읽도록 만드는 정확성 조건**이다.
