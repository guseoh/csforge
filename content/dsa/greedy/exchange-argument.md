---
kind: concept
contentKey: dsa.core.greedy.exchange-argument
topicContentKey: dsa.core.greedy
slug: exchange-argument
title: "교환 논증(Exchange Argument)"
summary: "최적해의 첫 선택을 탐욕 선택으로 교환해도 손실이 없음을 보인다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "탐욕 선택, 교환 논증과 구간 스케줄링의 정확성 증명 구조를 확인한다."
    displayOrder: 1
---
# 교환 논증(Exchange Argument)

교환 논증은 임의의 최적해를 하나 잡고, 그 안의 선택을 탐욕 알고리즘이 고른 선택으로 바꿔도 **실행 가능성과 목적값이 나빠지지 않음**을 보이는 증명 방법이다.

최적해 `OPT`의 첫 선택이 `o`, 탐욕 선택이 `g`라고 하자. `o`를 `g`로 교체한 뒤에도 모든 제약 조건을 만족하고 목적값이 같거나 더 좋다면 `g`를 포함하는 최적해가 존재한다.

```text
OPT  = [o, ...]
         ↓ 교환
OPT' = [g, ...]
```

이 한 번의 교환이 가능한 이유를 정확히 설명하는 것이 핵심이다. 단순히 `g`가 더 작거나 빨라 보인다는 이유만으로는 충분하지 않다.

첫 선택을 탐욕 선택과 맞춘 뒤 남은 부분 문제에도 같은 논증을 반복할 수 있다면 탐욕 알고리즘이 만드는 전체 해와 일치하는 최적해를 구성할 수 있다.

교환 논증은 탐욕 알고리즘의 정확성을 증명하는 한 가지 패턴이다. 문제에 따라 컷 속성(cut property)이나 다른 증명 방식이 더 자연스러울 수 있으며, 목적이나 제약 조건이 바뀌면 기존 교환 논증도 다시 검토해야 한다.
