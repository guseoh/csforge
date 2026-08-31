---
kind: concept
contentKey: dsa.core.greedy.greedy-failure
topicContentKey: dsa.core.greedy
slug: greedy-failure
title: "Greedy Failure"
summary: "local optimum이 global optimum을 보장하지 않는 반례를 분석한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "weighted shortest path의 relaxation 조건을 확인한다."
    displayOrder: 1
---
# Greedy Failure

greedy는 한 단계의 좋은 선택이 미래 선택지를 잠그는 문제에서 실패한다. 동전 액면가처럼 특수한 구조가 아니면 가장 큰 값부터 고르는 규칙이 최소 개수나 최대 가치 해를 보장하지 않을 수 있다.

실패를 보이려면 greedy 결과보다 좋은 작은 입력 반례를 제시하면 된다. 반례가 있으면 exchange argument가 성립하지 않는 지점을 찾고, 상태별 최적값을 기록하는 DP나 완전 탐색으로 전환한다.

### Backend 연결

추천 ranking heuristic을 최적이라고 포장하지 않고 품질 기준과 반례를 테스트 데이터로 보존한다. 정책 변경 때 기존 선택과 새 선택의 차이를 Preview에서 확인하게 한다.
