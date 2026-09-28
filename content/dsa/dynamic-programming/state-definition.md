---
kind: concept
contentKey: dsa.core.dynamic-programming.state-definition
topicContentKey: dsa.core.dynamic-programming
slug: state-definition
title: "동적 계획법 상태 정의(DP State)"
summary: "상태가 표현하는 부분 문제와 필요한 정보를 정확히 정의한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 부분 문제 정의, 메모이제이션, 점화식과 재사용 구조를 확인한다."
    displayOrder: 1
---
# 동적 계획법 상태 정의(DP State)

동적 계획법에서 먼저 정해야 하는 것은 배열의 차원이 아니라 **각 상태가 어떤 부분 문제의 답을 의미하는가**다.

좋은 상태는 그 값들만 알면 앞으로 가능한 선택과 결과를 결정할 수 있을 만큼 충분한 정보를 담으면서, 이후 결과에 영향을 주지 않는 과거 정보는 제외한다.

예를 들어 0/1 배낭 문제에서는 다음처럼 정의할 수 있다.

```text
dp[i][w]
= 앞의 i개 물건만 고려했을 때
  용량 w에서 얻을 수 있는 최대 가치
```

`i`를 빼면 어떤 물건이 아직 선택 가능한지 알 수 없고, `w`를 빼면 남은 용량이 다른 부분 문제를 하나로 합치게 된다. 반대로 앞으로의 결과에 필요 없는 전체 선택 이력까지 상태에 넣으면 서로 다른 상태 수만 커지고 중복 계산을 합치기 어렵다.

상태는 기호보다 문장으로 먼저 정의하는 것이 좋다. 그 문장이 정해지면 기저 상태, 전이, 계산 순서와 최종 답의 위치를 일관되게 설계할 수 있다.

또 상태 변수의 범위는 복잡도와 직접 연결된다. `i=0..N`, `w=0..W`라면 가능한 상태 수는 대략 O(NW)다. 따라서 상태 변수를 하나 추가하면 저장해야 할 상태 수와 계산량이 함께 커질 수 있다.
