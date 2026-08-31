---
kind: concept
contentKey: dsa.core.search-sort.merge-sort
topicContentKey: dsa.core.search-sort
slug: merge-sort
title: "Merge Sort"
summary: "분할·정렬·merge invariant와 안정성·추가 공간을 분석한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "comparison sort의 decision-tree 하한을 확인한다."
    displayOrder: 1
---
# Merge Sort

merge sort는 배열을 반으로 나누고 각 절반을 정렬한 뒤 두 sorted sequence의 앞 원소를 비교해 합친다. merge 중 출력 prefix가 항상 전체 입력의 가장 작은 남은 원소라는 invariant가 correctness를 만든다. 시간은 O(n log n)이고 보통 보조 배열이 필요하다.

동일 key에서 왼쪽 원소를 먼저 고르면 stable sort가 된다. 보조 공간을 줄이는 in-place 변형은 구현과 memory 이동 비용이 커질 수 있으며, linked list나 external sort에서는 merge의 순차 접근 장점이 커진다.

### Backend 연결

대량 export와 external merge에서 sequential I/O와 memory buffer를 설계한다. sort 결과를 pagination에 사용하면 unique tie-breaker가 필요하다.
