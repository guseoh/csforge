---
kind: concept
contentKey: dsa.core.dynamic-programming.optimal-substructure
topicContentKey: dsa.core.dynamic-programming
slug: optimal-substructure
title: "Optimal Substructure"
summary: "전체 최적해가 부분 문제의 최적해로 구성되는 조건을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Optimal Substructure

optimal substructure는 전체 문제의 optimal solution이 적절한 부분 문제의 optimal solution을 포함한다는 성질이다. 마지막 선택을 고정했을 때 남은 부분이 최적이 아니면 그 부분만 더 좋은 해로 바꿔 전체를 개선할 수 있어야 한다.

이 성질만으로 DP가 되는 것은 아니다. 상태가 부분 문제를 충분히 구분하고, 같은 상태가 반복되며, 전이 순서가 base case에서 답까지 닿아야 한다.

### Backend 연결

학습 경로의 누적 점수 최적화에서 “마지막 선택 이전의 최적 경로”가 무엇을 의미하는지 상태에 포함한다. 사용자별 제약을 누락하면 재사용한 DP 결과가 잘못될 수 있다.
