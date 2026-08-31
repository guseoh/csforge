---
kind: concept
contentKey: dsa.core.search-sort.radix-sort
topicContentKey: dsa.core.search-sort
slug: radix-sort
title: "Radix Sort"
summary: "자리별 stable pass가 전체 순서를 만드는 전제를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 110
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "comparison sort의 decision-tree 하한을 확인한다."
    displayOrder: 1
---
# Radix Sort

radix sort는 숫자나 문자열을 자리로 나누고 각 자리에서 stable sort를 반복한다. LSD 방식은 낮은 자리 정렬 결과가 다음 높은 자리에서도 보존되어야 하며, 마지막 pass 뒤에는 전체 key 순서가 된다.

시간은 자리 수와 base, 입력 수에 좌우되고 count array나 bucket memory가 필요하다. signed 값·가변 길이 문자열·leading zero를 처리하는 규칙을 정하지 않으면 숫자 순서와 lexicographic 순서가 섞인다.

### Backend 연결

고정 폭 ID와 제한된 문자열 key를 대량 정렬할 때 후보가 된다. key 범위와 encoding을 명시하고 comparator 기반 정렬과 실제 memory bandwidth를 비교한다.
