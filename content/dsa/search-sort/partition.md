---
kind: concept
contentKey: dsa.core.search-sort.partition
topicContentKey: dsa.core.search-sort
slug: partition
title: "Partition"
summary: "pivot보다 작은·큰 구간 invariant를 포인터 이동으로 유지한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "comparison sort의 decision-tree 하한을 확인한다."
    displayOrder: 1
---
# Partition

partition은 아직 분류되지 않은 구간을 두 pointer로 훑으며 pivot보다 작은 영역과 큰 영역을 유지한다. pointer가 가리킨 값이 양쪽 조건에 맞지 않을 때 swap하고, loop 종료 뒤 pivot 위치와 양 구간의 포함 범위를 정의해야 한다.

`<`와 `<=` 중 무엇을 쓰는지는 duplicate pivot 처리와 종료를 바꾼다. partition이 완료됐다고 두 구간이 각각 정렬됐다는 뜻은 아니며, quicksort는 그 위에서 재귀를 수행해야 한다.

### Backend 연결

입력 key에 동일 값이 많은 서비스에서 partition 성능과 stack depth를 측정한다. in-place swap은 memory를 아끼지만 원본 배열을 변경하므로 API ownership을 명시한다.
