---
kind: concept
contentKey: dsa.core.greedy.greedy-failure
topicContentKey: dsa.core.greedy
slug: greedy-failure
title: "탐욕법이 실패하는 경우"
summary: "증명 없는 국소 최적 선택이 반례에서 실패하는 조건을 판단한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "탐욕 선택, 교환 논증과 구간 스케줄링의 정확성 증명 구조를 확인한다."
    displayOrder: 1
---
# 탐욕법이 실패하는 경우

탐욕 규칙이 항상 최적이라는 주장은 허용되는 입력 중 **반례 하나**만 있어도 깨진다. 현재 가장 좋아 보이는 선택이 미래의 더 좋은 조합을 막을 수 있기 때문이다.

예를 들어 동전 `[1, 3, 4]`로 금액 6을 최소 개수로 만들 때 가장 큰 동전부터 고르면 다음 결과가 나온다.

```text
4 + 1 + 1 = 3개
```

하지만 최적해는 `3 + 3 = 2개`다. 따라서 "항상 가장 큰 동전을 고른다"는 국소 규칙은 임의의 동전 체계에서 전역 최적해를 보장하지 않는다.

탐욕법이 실패하면 단순히 다른 알고리즘을 외우기보다 증명의 어느 조건이 깨졌는지 확인하는 것이 중요하다. 탐욕 선택을 최적해와 안전하게 교환할 수 없는지, 교환하면 제약 조건이 깨지는지, 또는 남은 문제에 최적 부분 구조가 유지되지 않는지를 본다.

비슷한 입력이라도 제약 조건이 달라지면 결과가 달라질 수 있다. 예를 들어 분할 가능 배낭 문제(fractional knapsack)는 물건 일부를 선택할 수 있어 단위 무게당 가치가 큰 물건부터 고르는 탐욕법이 성립한다. 반면 0/1 배낭 문제는 물건을 통째로 선택해야 하므로 같은 규칙이 최적해를 보장하지 않는다.

따라서 탐욕법을 선택할 때는 작은 예제 몇 개의 성공이 아니라 **증명 가능한 선택 조건과 반례 가능성**을 함께 확인해야 한다.
