---
kind: concept
contentKey: dsa.core.greedy.global-optimum-proof
topicContentKey: dsa.core.greedy
slug: global-optimum-proof
title: "전역 최적성 증명"
summary: "국소 선택에서 전체 최적을 이끌어내는 증명 구조를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "탐욕 선택, 교환 논증과 구간 스케줄링의 정확성 증명 구조를 확인한다."
    displayOrder: 1
---
# 전역 최적성 증명

탐욕 알고리즘이 몇 개의 예제에서 좋은 결과를 냈다는 사실만으로 전역 최적성을 보장할 수는 없다. 먼저 어떤 해가 제약 조건을 만족하는지, 그리고 무엇을 최소화하거나 최대화하는지를 명확히 정의해야 한다.

증명은 보통 두 질문으로 나뉜다.

1. 현재 탐욕 선택을 포함해도 최적해를 잃지 않는가?
2. 그 선택 이후 남은 부분 문제를 최적으로 풀면 전체도 최적인가?

첫 질문은 교환 논증이나 컷 속성(cut property) 같은 방식으로, 두 번째는 최적 부분 구조(optimal substructure)를 이용해 설명할 수 있다.

어떤 최적해 `OPT`의 첫 선택이 탐욕 선택 `g`와 다르더라도, 그 선택을 `g`로 바꿨을 때 실행 가능성과 목적값이 유지된다면 `g`를 포함하는 최적해가 존재한다. 이후 남은 더 작은 문제에 같은 논리를 반복 적용한다.

즉 탐욕법의 정확성을 증명하려면 **국소 선택이 안전하고, 그 뒤 남은 문제에도 최적 부분 구조가 유지된다는 것**을 보여야 한다. 둘 중 하나라도 보이지 않으면 탐욕법의 최적성은 별도로 검증해야 한다.
