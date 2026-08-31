---
kind: concept
contentKey: dsa.core.dynamic-programming.memoization
topicContentKey: dsa.core.dynamic-programming
slug: memoization
title: "Memoization"
summary: "top-down 재귀 결과를 cache해 중복 계산을 제거한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Memoization

memoization은 top-down 재귀가 같은 state를 다시 만나면 계산 결과를 table이나 map에서 꺼내도록 한다. 필요한 state만 demand-driven으로 계산할 수 있지만 recursion depth와 cache key 설계가 중요하다.

계산 중인 state를 다시 만나면 순환 의존을 감지하고, 실패 결과와 미계산 상태를 구분해야 한다. state의 모든 의미 있는 변수를 key에 넣지 않으면 서로 다른 부분 문제가 잘못 공유된다.

### Backend 연결

추천·통계 query를 memoize할 때 user, policy, canonical data version을 key에 포함한다. 파생 cache는 invalidation과 재계산 경로를 가져야 한다.
