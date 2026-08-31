---
kind: concept
contentKey: dsa.core.search-sort.quicksort
topicContentKey: dsa.core.search-sort
slug: quicksort
title: "Quicksort"
summary: "pivot 분할과 최악 편향, 평균 성능을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "comparison sort의 decision-tree 하한을 확인한다."
    displayOrder: 1
---
# Quicksort

quicksort는 pivot을 기준으로 작은 값과 큰 값 구간을 나눈 뒤 두 구간을 재귀 정렬한다. partition 후 pivot의 왼쪽은 작고 오른쪽은 크다는 invariant가 맞아야 하며, 균형 분할이면 평균 O(n log n)이다.

이미 정렬된 입력에서 나쁜 pivot을 고르면 한쪽 구간만 남아 O(n²)이 된다. random pivot·median 선택은 worst를 완전히 없애지 않고 가능성을 낮추며, recursion depth와 stack 사용도 경계 조건이다.

### Backend 연결

외부 입력을 직접 정렬할 때 adversarial 배열과 recursion limit을 테스트한다. stable ordering이 필요하면 quicksort의 기본 특성만 믿지 말고 안정 정렬이나 명시적 tie-breaker를 선택한다.
