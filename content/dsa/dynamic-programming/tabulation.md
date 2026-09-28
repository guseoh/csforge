---
kind: concept
contentKey: dsa.core.dynamic-programming.tabulation
topicContentKey: dsa.core.dynamic-programming
slug: tabulation
title: "상향식 계산(Tabulation)"
summary: "기저 상태부터 의존 관계 순서에 맞춰 상향식으로 표를 채운다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 부분 문제 정의, 메모이제이션, 점화식과 재사용 구조를 확인한다."
    displayOrder: 1
---
# 상향식 계산(Tabulation)

테이블 방식은 기저 상태부터 시작해 필요한 이전 상태가 이미 계산된 순서로 DP 테이블을 채우는 상향식 방식이다.

피보나치 수를 계산한다면 다음처럼 작은 상태부터 진행할 수 있다.

```text
dp[0] = 0
dp[1] = 1
for i = 2..n:
    dp[i] = dp[i-1] + dp[i-2]
```

중요한 것은 반복문의 방향 자체가 아니라 **현재 상태가 참조하는 의존 상태가 먼저 계산되어 있어야 한다는 것**이다. 구간 DP처럼 짧은 구간의 값에 의존한다면 구간 길이가 작은 순서부터 계산해야 할 수 있다.

테이블 방식은 재귀를 사용하지 않아 호출 스택 깊이 문제를 피할 수 있고, 메모리를 순차적으로 접근하기 쉽게 구성할 수 있다. 반면 목표 상태에 필요하지 않은 상태라도 테이블 범위에 포함되어 있으면 함께 계산할 수 있다.

메모이제이션과 테이블 방식은 서로 다른 점화식을 쓰는 방법이라기보다 같은 상태 관계를 다른 순서로 평가하는 전략일 수 있다. 따라서 어느 방식을 쓸지보다 먼저 상태, 전이, 기저 상태와 의존 순서가 정확해야 한다.

상향식 계산에서는 도달할 수 없는 상태를 정상 초기값과 구분하는 것도 중요하다. 초기화가 잘못되면 점화식이 아직 도달할 수 없는 상태를 유효한 이전 상태로 읽을 수 있다.
