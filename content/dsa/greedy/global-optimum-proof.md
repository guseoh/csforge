---
kind: concept
contentKey: dsa.core.greedy.global-optimum-proof
topicContentKey: dsa.core.greedy
slug: global-optimum-proof
title: "Global Optimum Proof"
summary: "local choice에서 전체 최적을 이끌어내는 증명 구조를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "weighted shortest path의 relaxation 조건을 확인한다."
    displayOrder: 1
---
# Global Optimum Proof

greedy의 correctness는 알고리즘이 만든 해의 비용이 낮아 보인다는 관찰이 아니라 모든 최적해를 greedy prefix를 포함하는 최적해로 바꿀 수 있다는 논증으로 세운다. 이후 남은 suffix에 대해 같은 주장을 귀납적으로 적용한다.

증명에는 feasible solution의 정의와 목적 함수가 필요하다. tie가 여러 개면 어느 선택을 해도 안전한지, 특정 tie-breaker만 안전한지를 구분해야 한다.

### Backend 연결

추천 순위나 import conflict 해결에서 “첫 항목 우선” 정책을 쓰려면 전체 목적 함수와 동률 처리 규칙을 문서화한다. 검증되지 않은 heuristic은 최적 결과라고 표시하지 않는다.
