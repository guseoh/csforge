---
kind: concept
contentKey: dsa.core.dynamic-programming.overlapping-subproblems
topicContentKey: dsa.core.dynamic-programming
slug: overlapping-subproblems
title: "중복 부분 문제(Overlapping Subproblems)"
summary: "재귀 과정에서 같은 부분 문제가 반복될 때 결과를 저장해 재사용할 수 있는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 부분 문제 정의, 메모이제이션, 점화식과 재사용 구조를 확인한다."
    displayOrder: 1
---
# 중복 부분 문제(Overlapping Subproblems)

동적 계획법이 효과적인 대표 조건 가운데 하나는 서로 다른 계산 경로에서 **같은 부분 문제의 상태를 반복해서 계산하는 것**이다.

단순 재귀로 피보나치 수를 계산하면 `fib(3)`, `fib(2)` 같은 호출이 여러 분기에서 반복된다. 호출 경로의 수는 빠르게 늘어나지만 실제로 서로 다른 상태는 `0..n` 정도뿐이므로, 한 번 계산한 결과를 상태별로 저장하면 중복 계산을 줄일 수 있다.

```text
fib(5)
├─ fib(4)
│  ├─ fib(3)
│  └─ fib(2)
└─ fib(3)  ← 다른 경로에서 같은 상태가 다시 등장
```

두 `fib(3)` 호출은 도달한 경로는 다르지만 앞으로 계산할 답을 결정하는 상태가 같으므로 하나의 계산 결과를 재사용할 수 있다.

중요한 것은 함수 이름이나 재귀 깊이가 같다는 사실이 아니라 **앞으로의 답을 결정하는 상태가 같은가**다. 예를 들어 `solve(index=4, capacity=10)`과 `solve(index=4, capacity=3)`은 `index`가 같아도 남은 `capacity`가 다르므로 서로 다른 부분 문제다.

따라서 메모이제이션을 적용하기 전에 어떤 변수들이 같아야 동일한 상태인지 먼저 정의해야 한다. 상태 키가 필요한 정보를 빠뜨리면 서로 다른 문제의 답을 같은 값으로 취급해 잘못 재사용할 수 있다.

분할 정복(Divide and Conquer)처럼 부분 문제가 서로 겹치지 않는다면 계산 결과를 저장해 얻는 이점이 크지 않을 수 있다. 동적 계획법에서 중요한 것은 재귀를 사용하느냐가 아니라 **같은 상태의 부분 문제가 반복해서 등장하느냐**다.
