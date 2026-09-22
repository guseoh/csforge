---
kind: concept
contentKey: dsa.core.dynamic-programming.overlapping-subproblems
topicContentKey: dsa.core.dynamic-programming
slug: overlapping-subproblems
title: "Overlapping Subproblems"
summary: "재귀에서 같은 부분 문제가 반복되어 저장 가치가 생기는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2008/resources/lec19/"
    title: "Lecture 19: Dynamic Programming I: Memoization, Fibonacci, Crazy Eights, Guessing"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DP의 subproblem 정의, memoization, recurrence와 재사용 구조를 확인한다."
    displayOrder: 1
---
# Overlapping Subproblems

Dynamic Programming이 효과적인 대표 조건은 서로 다른 재귀 경로에서 **같은 subproblem state를 반복해서 계산하는 것**이다.

Naive Fibonacci에서는 `fib(3)`, `fib(2)` 같은 호출이 여러 branch에서 반복된다. 호출 경로는 많아도 실제 distinct state는 `0..n` 정도뿐이므로, 같은 state의 결과를 저장하면 반복 계산을 제거할 수 있다.

```text
fib(5)
├─ fib(4)
│  ├─ fib(3)
│  └─ fib(2)
└─ fib(3)  ← 다른 경로에서 같은 state가 다시 등장
```

두 `fib(3)` 호출은 도달 경로는 다르지만 앞으로 계산할 답을 결정하는 state가 같으므로 하나의 저장 결과를 재사용할 수 있다.

중요한 것은 함수 이름이 같다는 사실이 아니라 **앞으로의 답을 결정하는 state가 같은가**다. 예를 들어 `solve(index=4, capacity=10)`과 `solve(index=4, capacity=3)`은 index가 같아도 남은 capacity가 달라 서로 다른 subproblem이다.

따라서 memoization을 적용하기 전에 어떤 변수들이 같아야 동일 state인지 정의해야 한다. State key가 부족하면 서로 다른 문제의 답을 잘못 재사용해 correctness가 깨진다.

Divide and Conquer처럼 부분 문제가 서로 겹치지 않는다면 저장 효과가 크지 않을 수 있다. DP의 핵심은 재귀 여부가 아니라 **반복되는 distinct state가 존재하는가**다.
