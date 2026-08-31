---
kind: concept
contentKey: dsa.core.greedy.greedy-choice
topicContentKey: dsa.core.greedy
slug: greedy-choice
title: "Greedy Choice"
summary: "현재 선택이 최적성을 보존하는 조건을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "weighted shortest path의 relaxation 조건을 확인한다."
    displayOrder: 1
---
# Greedy Choice

greedy 알고리즘은 현재 가장 유망한 선택을 하고 남은 문제를 계속 푼다. 이 선택이 전역 최적해로 확장될 수 있다는 greedy-choice property가 있어야 하며, 단순히 작은 값이나 빠른 선택을 고르는 것만으로는 충분하지 않다.

선택 후 남은 문제가 같은 형태인지, 선택을 취소할 필요가 없는지, 교환 또는 cut 논증을 만들 수 있는지 확인한다. 반례를 먼저 찾으면 greedy가 실패하는 문제를 DP로 잘못 구현하는 일을 줄일 수 있다.

### Backend 연결

우선순위가 있는 학습 추천에서 greedy를 사용하려면 한 번 선택한 concept을 뒤집지 않아도 된다는 정책 근거가 필요하다. 그렇지 않으면 후보 전체를 비교하는 방법을 사용한다.
