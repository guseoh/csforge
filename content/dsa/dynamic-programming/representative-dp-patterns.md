---
kind: concept
contentKey: dsa.core.dynamic-programming.representative-dp-patterns
topicContentKey: dsa.core.dynamic-programming
slug: representative-dp-patterns
title: "Representative DP Patterns"
summary: "선형·격자·배낭 모양을 state-transition으로 변환하는 기준을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Representative DP Patterns

선형 DP는 index와 이전 몇 state, 격자 DP는 좌표와 이동 방향, 배낭 DP는 item index와 capacity를 state로 둔다. 이름이 아니라 “앞으로의 선택 결과를 결정하는 최소 정보”가 state 축을 정한다.

각 pattern은 base case, transition, computation order, answer 위치가 다르다. 문제를 유형명에 억지로 맞추지 말고 작은 입력에서 state가 모든 미래 선택을 결정하는지 확인한다.

### Backend 연결

학습 경로·시간 budget·콘텐츠 dependency가 들어간 최적화에서 사용자별 제약을 state에 누락하지 않는다. DP 결과는 정책과 content version이 바뀌면 재계산한다.
