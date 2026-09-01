---
kind: concept
contentKey: dsa.core.recursion-backtracking.recursion-call-state
topicContentKey: dsa.core.recursion-backtracking
slug: recursion-call-state
title: "Recursion Call State"
summary: "각 재귀 frame이 입력·local state·return point를 독립적으로 보존하고 base case로 수렴하는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "recursive algorithm의 call structure와 operation count를 분석한다."
    displayOrder: 1
---
# Recursion Call State

### 재귀는 '같은 함수'가 아니라 서로 다른 call frame의 연속이다

`factorial(4)`가 `factorial(3)`을 호출해도 두 호출은 같은 local variable을 공유하는 하나의 실행이 아니다. 각 call frame은 자신의 parameter, local state, return address를 별도로 보존한다.

```text
factorial(4)
 └─ factorial(3)
     └─ factorial(2)
         └─ factorial(1)
```

가장 깊은 호출이 return해야 그 위 frame이 중단했던 계산을 이어 갈 수 있다. 그래서 recursion을 이해할 때는 내려가는 call path와 올라오는 return path를 따로 보는 것이 좋다.

### base case와 progress가 종료를 만든다

재귀 함수는 더 이상 recursive call을 하지 않는 base case가 필요하다. 하지만 base case가 코드에 존재하는 것만으로 충분하지 않다. recursive case가 입력 state를 실제로 base case 쪽으로 이동시켜야 한다.

예를 들어 `f(n) -> f(n-1)`에서 n이 양수이고 base가 `n==0`이면 progress가 분명하다. 반대로 특정 input에서 `f(n)`이 다시 `f(n)`을 호출하면 base case가 있어도 도달하지 못한다.

### return 시점에는 하위 호출 결과와 현재 frame state를 결합한다

재귀 tree sum이라면 child 호출이 반환한 값을 현재 node 값과 합친다. 즉 frame은 단순히 parameter만 저장하는 것이 아니라 **하위 작업이 끝난 뒤 무엇을 해야 하는지**도 보존한다.

```text
sum(node)
  leftResult  = sum(node.left)
  rightResult = sum(node.right)
  return node.value + leftResult + rightResult
```

이 구조를 explicit stack으로 바꾸려면 현재 node뿐 아니라 'left를 처리했는지/right를 처리했는지' 같은 continuation state도 직접 표현해야 할 수 있다.

### recursion depth와 total work는 다른 값이다

balanced binary tree traversal은 n개 node를 모두 방문하므로 total work는 O(n)이지만 recursion depth는 height O(log n)일 수 있다. skewed tree라면 total work O(n)은 같아도 depth가 O(n)까지 커져 call-stack 위험이 달라진다.

따라서 recursion을 평가할 때 time complexity와 maximum call depth를 별도로 계산해야 한다.

### 같은 state를 반복 호출하면 다른 패턴을 검토한다

naive Fibonacci처럼 동일한 `f(k)`를 여러 branch에서 반복 계산하면 recursion tree가 급격히 커진다. 이 경우 memoization으로 이미 계산한 state를 재사용하거나 bottom-up DP로 state 계산 순서를 바꾸는 것이 자연스럽다.

재귀 자체가 느린 것이 아니라 **subproblem overlap을 무시한 recursive state graph**가 문제인지 구분해야 한다.
