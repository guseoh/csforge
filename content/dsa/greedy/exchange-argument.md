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
    recommendation: "interval scheduling의 exchange argument가 feasibility와 objective를 보존하는지 확인한다."
    displayOrder: 1
---
# Exchange Argument

exchange argument는 임의의 optimal solution을 잡고 그 안의 선택 하나를 greedy 선택으로 바꾼다. 바꾼 뒤에도 feasible하고 목적 함수가 나빠지지 않으면 greedy 선택을 포함하는 optimal solution이 존재한다. 예를 들어 interval scheduling에서는 optimal solution의 첫 interval을 가장 빨리 끝나는 interval로 교환해도 뒤에 배치할 수 있는 후보가 줄지 않는다.

이 과정을 반복하면 알고리즘의 모든 prefix가 어떤 최적해의 prefix가 된다. 교환이 feasibility를 깨뜨리지 않는 이유와 비용이 증가하지 않는 부등식을 각각 명시해야 한다. 교환 가능성이 없는 weighted interval scheduling에 같은 주장을 그대로 적용하면 안 되며, 목표와 제약이 바뀌었는지 먼저 확인한다.

같은 우선순위의 학습 항목을 교체하는 정책도 schedule 제약과 목적 함수를 보존하는지 따져야 한다. 근거 없는 교체는 기존 사용자의 명시적 선택을 덮어쓰지 않게 한다.
