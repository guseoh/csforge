---
kind: concept
contentKey: dsa.core.greedy.global-optimum-proof
topicContentKey: dsa.core.greedy
slug: global-optimum-proof
title: "Global Optimum Proof"
summary: "local choice에서 전체 최적을 이끌어내는 증명 구조를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "greedy choice, exchange argument와 interval scheduling의 correctness proof 구조를 확인한다."
    displayOrder: 1
---
# Global Optimum Proof

Greedy algorithm이 몇 개의 예제에서 좋은 결과를 냈다는 사실만으로 global optimum을 보장할 수는 없다. 먼저 어떤 solution이 feasible한지와 무엇을 최소화·최대화하는지 objective를 정의해야 한다.

증명은 보통 두 질문으로 나뉜다.

1. 현재 greedy choice를 포함해도 optimal solution을 잃지 않는가?
2. 그 선택 이후 남은 subproblem을 최적으로 풀면 전체도 최적인가?

첫 질문은 exchange argument나 cut property 같은 방식으로, 두 번째는 optimal substructure를 이용해 설명할 수 있다.

어떤 optimal solution `OPT`의 첫 선택이 greedy choice `g`와 다르더라도, 그 선택을 `g`로 바꿨을 때 feasibility와 objective가 유지된다면 `g`를 포함하는 optimal solution이 존재한다. 이후 남은 더 작은 문제에 같은 논리를 반복 적용한다.

즉 greedy proof의 핵심은 **local choice가 안전하고, 그 뒤 남은 문제에도 같은 optimal structure가 유지된다는 것**이다. 이 둘 중 하나라도 보이지 않으면 greedy의 최적성은 별도로 검증해야 한다.
