---
kind: concept
contentKey: dsa.core.dynamic-programming.tabulation
topicContentKey: dsa.core.dynamic-programming
slug: tabulation
title: "Tabulation"
summary: "base state부터 dependency 순으로 bottom-up 표를 채운다."
level: 1
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
# Tabulation

tabulation은 base case를 table에 초기화하고 dependency가 해결되는 순서로 다음 state를 채우는 bottom-up 방식이다. recursion overhead가 없고 계산 순서가 눈에 보이지만 답에 도달하지 않는 state도 계산할 수 있다.

각 축의 의미, 초기값, iteration direction이 recurrence와 일치해야 한다. 이전 row만 필요하면 rolling table로 줄일 수 있지만 path 복원에 필요한 predecessor를 잃지 않도록 한다.

### Backend 연결

기간별 학습 통계를 표로 계산할 때 snapshot 기준일과 누락 state의 초기값을 고정한다. 부분 batch와 전체 table 교체 경계를 분리한다.
