---
kind: concept
contentKey: dsa.core.dynamic-programming.overlapping-subproblems
topicContentKey: dsa.core.dynamic-programming
slug: overlapping-subproblems
title: "Overlapping Subproblems"
summary: "서로 다른 호출 경로가 같은 상태를 반복하는 현상을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Overlapping Subproblems

재귀 분해에서 동일한 입력 상태가 여러 경로로 다시 나타나면 overlapping subproblems가 있다. 결과를 memo에 저장하면 각 상태를 한 번 계산하고, bottom-up table로 같은 의존 순서를 반복할 수도 있다.

memo key가 상태의 모든 의미 있는 변수를 포함해야 한다. 일부 입력만 key로 쓰면 서로 다른 subproblem이 같은 결과를 공유해 조용한 오답을 만든다.

### Backend 연결

반복되는 개념 추천 계산을 cache할 때 사용자, 콘텐츠 버전, 정책 버전을 key에 포함한다. stale cache는 정답 데이터가 아니라 재계산 가능한 파생 결과로 둔다.
