---
kind: concept
contentKey: dsa.core.greedy.greedy-choice
topicContentKey: dsa.core.greedy
slug: greedy-choice
title: "탐욕 선택(Greedy Choice)"
summary: "현재 선택이 남은 문제를 손상하지 않는 탐욕 선택 조건을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "탐욕 선택, 교환 논증과 구간 스케줄링의 정확성 증명 구조를 확인한다."
    displayOrder: 1
---
# 탐욕 선택(Greedy Choice)

탐욕 알고리즘은 매 단계에서 현재 기준으로 가장 좋은 선택을 하고, 일반적으로 그 선택을 다시 되돌리지 않는다. 그래서 단순히 "지금 가장 좋아 보이는 것"을 고르는 것만으로는 정확성을 보장할 수 없다.

탐욕 선택이 안전하려면 어떤 최적해 중 적어도 하나를 **현재 탐욕 선택을 포함하는 형태로 바꿔도 목적값이 나빠지지 않아야 한다.** 이를 탐욕 선택 속성(greedy-choice property)이라고 한다.

또 첫 선택 이후 남은 문제도 같은 종류의 최적화 문제로 남아야 한다. 그래야 같은 탐욕 규칙을 반복 적용해 전체 해를 만들 수 있다.

```text
안전한 국소 선택
      ↓
남은 부분 문제
      ↓
같은 규칙 반복
      ↓
전체 해
```

백트래킹은 잘못된 선택을 되돌릴 수 있고 DP는 여러 상태의 결과를 비교하지만, 탐욕법은 선택을 확정한다. 따라서 한 번의 선택이 미래의 더 좋은 조합을 막을 수 있다면 탐욕법이 적합하지 않을 수 있다.

탐욕법을 적용할 때는 구현보다 먼저 **왜 이 선택을 포함하는 최적해가 존재하는가**를 설명할 수 있어야 한다.
