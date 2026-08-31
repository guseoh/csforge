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
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "weighted shortest path의 relaxation 조건을 확인한다."
    displayOrder: 1
---
# Exchange Argument

exchange argument는 임의의 optimal solution을 잡고 그 안의 선택 하나를 greedy 선택으로 바꾼다. 바꾼 뒤에도 feasible하고 목적 함수가 나빠지지 않으면 greedy 선택을 포함하는 optimal solution이 존재한다.

이 과정을 반복하면 알고리즘의 모든 prefix가 어떤 최적해의 prefix가 된다. 교환이 feasibility를 깨뜨리지 않는 이유와 비용이 증가하지 않는 부등식을 각각 명시해야 한다.

### Backend 연결

같은 우선순위의 학습 항목을 교체해도 review schedule 제약이 유지되는지 확인하는 방식으로 정책 검증을 구조화할 수 있다. 근거 없는 교체는 기존 사용자의 명시적 선택을 덮어쓰지 않게 한다.
