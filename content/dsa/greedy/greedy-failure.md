---
kind: concept
contentKey: dsa.core.greedy.greedy-failure
topicContentKey: dsa.core.greedy
slug: greedy-failure
title: "Greedy Failure"
summary: "증명 없는 local optimum이 반례에서 실패하는 조건을 판단한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "greedy choice, exchange argument와 interval scheduling의 correctness proof 구조를 확인한다."
    displayOrder: 1
---
# Greedy Failure

Greedy rule이 항상 최적이라는 주장은 허용되는 입력 중 **counterexample 하나**만 있어도 깨진다. 현재 가장 좋아 보이는 선택이 미래의 더 좋은 조합을 막을 수 있기 때문이다.

예를 들어 동전 `[1, 3, 4]`로 금액 6을 최소 개수로 만들 때 가장 큰 동전부터 고르면 다음 결과가 나온다.

```text
4 + 1 + 1 = 3개
```

하지만 optimal solution은 `3 + 3 = 2개`다. 따라서 "항상 가장 큰 동전을 고른다"는 local rule은 임의의 동전 체계에서 global optimum을 보장하지 않는다.

Greedy가 실패하면 단순히 다른 알고리즘을 외우기보다 proof의 어느 조건이 깨졌는지 확인하는 것이 중요하다. Greedy choice를 optimal solution과 교환할 수 없는지, 교환하면 constraint가 깨지는지, 또는 남은 문제가 같은 optimal structure를 유지하지 않는지를 본다.

비슷한 입력 모양이어도 constraint가 달라지면 결과가 달라질 수 있다. Fractional knapsack은 물건을 나눌 수 있어 value/weight greedy가 성립하지만, 0/1 knapsack은 선택을 분할할 수 없어 같은 rule이 최적을 보장하지 않는다.

따라서 greedy를 선택할 때는 작은 예제가 아니라 **증명 가능한 선택 조건과 counterexample 가능성**을 함께 확인해야 한다.
