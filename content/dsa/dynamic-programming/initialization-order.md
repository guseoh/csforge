---
kind: concept
contentKey: dsa.core.dynamic-programming.initialization-order
topicContentKey: dsa.core.dynamic-programming
slug: initialization-order
title: "Initialization and Order"
summary: "base value와 계산 순서가 잘못될 때 생기는 오류를 분석한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Initialization and Order

DP table은 base state가 정확히 초기화되고 각 전이가 참조하는 이전 state가 먼저 계산되어야 한다. 최소화 문제의 unreachable 값을 0으로 채우면 실제 비용 0과 구분되지 않아 오답을 만들 수 있다.

0/1 선택처럼 계산 방향 자체가 재사용을 막는 invariant가 되는 문제도 있다. 작은 입력을 손으로 table에 채워 초기화·순서·answer 위치를 함께 검증한다.

### Backend 연결

일별 review score를 누적할 때 첫 날과 데이터 누락을 동일한 zero로 처리하지 않는다. 배치 재시작 시 이미 계산된 기간과 미계산 기간의 경계를 명확히 한다.
