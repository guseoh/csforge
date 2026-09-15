---
kind: concept
contentKey: dsa.core.recursion-backtracking.recursion-call-state
topicContentKey: dsa.core.recursion-backtracking
slug: recursion-call-state
title: "Recursion Call State"
summary: "각 호출의 parameter·base case·return state를 추적한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Recursion Call State

재귀 호출은 같은 함수 이름을 반복해서 실행하지만, 각 호출은 자신의 parameter, local state와 return point를 가진 독립된 call state다.

```text
factorial(4)
 └─ factorial(3)
     └─ factorial(2)
         └─ factorial(1)
```

가장 깊은 호출이 반환되면 바로 위 호출은 자신이 저장해 둔 state에서 계산을 이어 간다. 따라서 recursion을 추적할 때는 내려가는 호출 경로와 반환되며 결과를 결합하는 경로를 함께 봐야 한다.

재귀가 종료하려면 base case뿐 아니라 매 호출이 실제로 그 base case 쪽으로 진행해야 한다. `f(n) → f(n-1)`처럼 입력이 감소하는 규칙이 있다면 progress를 설명할 수 있지만, 같은 state를 다시 호출한다면 base case가 코드에 있어도 도달하지 못할 수 있다.

Time complexity와 maximum recursion depth는 다른 값이다. Balanced tree traversal은 전체 O(n) work를 하면서 depth는 O(log n)일 수 있지만, skewed tree에서는 같은 O(n) work라도 depth가 O(n)까지 커질 수 있다.

재귀를 이해하는 핵심은 함수 이름이 아니라 **각 frame이 어떤 state를 보존하고, 어떤 조건에서 더 작은 문제로 진행하며, 반환 시 무엇을 결합하는가**를 추적하는 것이다.
