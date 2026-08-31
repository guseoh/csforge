---
kind: concept
contentKey: dsa.core.search-sort.binary-search
topicContentKey: dsa.core.search-sort
slug: binary-search
title: "Binary Search"
summary: "정렬된 구간을 반으로 줄이는 탐색 상태를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Binary Search

정렬된 배열에서 mid를 비교하고 target이 있을 수 있는 절반만 남기면 탐색 구간이 매번 줄어 O(log n)이 된다. 핵심은 구간 양 끝의 포함 여부와 “답이 아직 이 안에 있다”는 invariant를 끝까지 유지하는 것이다.

중복 target에서 아무 위치를 찾는지 첫 위치를 찾는지에 따라 종료 후 추가 이동이 필요하다. `mid = (left+right)/2`의 overflow와 empty interval 종료 조건은 실제 구현에서 자주 실패한다.

### Backend 연결

정렬된 snapshot을 반복 조회할 때 index와 binary search를 선택한다. 데이터가 변경되는 동안 정렬 invariant가 깨지면 빠른 알고리즘도 잘못된 결과를 반환한다.
