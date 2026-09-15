---
kind: concept
contentKey: dsa.core.greedy.exchange-argument
topicContentKey: dsa.core.greedy
slug: exchange-argument
title: "Exchange Argument"
summary: "최적해의 첫 선택을 greedy 선택으로 교환해도 손실이 없음을 보인다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "greedy choice, exchange argument와 interval scheduling의 correctness proof 구조를 확인한다."
    displayOrder: 1
---
# Exchange Argument

Exchange argument는 임의의 optimal solution을 하나 잡고, 그 안의 선택을 greedy가 고른 선택으로 바꿔도 **feasibility와 objective가 나빠지지 않음**을 보이는 증명 방법이다.

Optimal solution `OPT`의 첫 선택이 `o`, greedy choice가 `g`라고 하자. `o`를 `g`로 교체한 뒤에도 모든 constraint를 만족하고 objective가 같거나 더 좋다면 `g`를 포함하는 optimal solution이 존재한다.

```text
OPT  = [o, ...]
         ↓ exchange
OPT' = [g, ...]
```

이 한 번의 교환이 가능한 이유를 정확히 설명하는 것이 핵심이다. 단순히 g가 더 작거나 빨라 보인다는 이유만으로는 충분하지 않다.

첫 선택을 greedy와 맞춘 뒤 남은 subproblem에도 같은 argument를 반복할 수 있다면 greedy solution 전체와 일치하는 optimal solution을 구성할 수 있다.

Exchange argument는 greedy correctness proof의 한 패턴이다. 문제에 따라 cut property나 다른 증명 방식이 더 자연스러울 수 있으며, objective나 constraint가 바뀌면 기존 exchange proof도 다시 검토해야 한다.
