---
kind: concept
contentKey: dsa.core.dynamic-programming.transition
topicContentKey: dsa.core.dynamic-programming
slug: transition
title: "DP Transition"
summary: "선행 상태에서 현재 상태를 만드는 recurrence를 작성한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# DP Transition

transition은 현재 state가 어떤 이전 state와 선택으로부터 만들어지는지 나타낸다. 최소화라면 후보 중 min, 최대화라면 max를 취하고, 선택하지 않는 경우와 선택하는 경우를 빠짐없이 포함해야 한다.

전이식이 상태 정의와 일치하는지 작은 입력을 손으로 계산한다. 순환 의존이 생기면 계산 순서가 없거나 state가 충분하지 않은 것이므로 다시 설계한다.

### Backend 연결

학습 통계 누적값을 이전 기간과 새 이벤트로 갱신할 때 각 전이의 중복 처리와 순서를 명시한다. 재시도 가능한 event consumer는 transition을 idempotent하게 만든다.
