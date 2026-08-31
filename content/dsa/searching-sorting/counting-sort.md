---
kind: concept
contentKey: dsa.core.search-sort.counting-sort
topicContentKey: dsa.core.search-sort
slug: counting-sort
title: "Counting Sort"
summary: "제한된 key 범위의 빈도로 비교를 없애는 조건과 공간을 분석한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "comparison sort의 decision-tree 하한을 확인한다."
    displayOrder: 1
---
# Counting Sort

counting sort는 비교 대신 key별 빈도 배열을 만들고 누적 위치로 결과를 배치한다. key 범위 `k`가 작을 때 O(n+k)로 빠르지만 값 범위가 크고 sparse하면 count array가 입력보다 훨씬 커진다.

누적 count를 사용하고 입력을 같은 key 순서로 처리하면 stable 결과를 만들 수 있다. 음수 key, 범위 overflow, count 합의 자료형을 정하지 않으면 빈도 계산 자체가 틀어진다.

### Backend 연결

status code·작은 enum·bounded rank 정렬에 유용하다. 사용자 입력이 범위 제한을 넘는 경우 reject 또는 다른 정렬로 fallback하고 메모리 할당 상한을 둔다.
