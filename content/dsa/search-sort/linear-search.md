---
kind: concept
contentKey: dsa.core.search-sort.linear-search
topicContentKey: dsa.core.search-sort
slug: linear-search
title: "Linear Search"
summary: "순차 검사와 조기 종료의 correctness·최악 비용을 설명한다."
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
# Linear Search

linear search는 첫 원소부터 equality를 검사해 target을 찾거나 끝에서 실패한다. 정렬되지 않은 입력에도 적용할 수 있고 첫 match를 반환할 수 있지만, best case O(1)과 worst case O(n)을 구분해야 한다.

중복이 있을 때 first·any·all 중 어떤 결과를 요구하는지가 correctness다. 비교 함수가 null과 동등성 규칙을 다르게 다루면 알고리즘 비용 이전에 결과 의미가 깨진다.

### Backend 연결

작은 bounded list와 대규모 검색 index를 구분해 선택한다. page 내부 filter에서는 linear scan이 단순하지만 입력 상한과 p99를 문서화한다.
