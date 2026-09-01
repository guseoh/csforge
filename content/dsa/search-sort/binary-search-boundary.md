---
kind: concept
contentKey: dsa.core.search-sort.binary-search-boundary
topicContentKey: dsa.core.search-sort
slug: binary-search-boundary
title: "Binary Search Boundary"
summary: "left·right invariant로 lower/upper boundary를 구현하는 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Binary Search Boundary

lower bound는 `value >= target`인 첫 위치, upper bound는 `value > target`인 첫 위치다. `left`는 답이 될 수 없는 구간과 `right`의 포함 규칙을 먼저 정하고, loop가 끝날 때 `left == right`가 boundary라는 invariant를 보이도록 구현한다.

중복 값에서 조건을 `>=` 대신 `>`로 바꾸면 두 boundary가 뒤집힌다. half-open `[left, right)` 구간과 inclusive `[left, right]`를 섞으면 빈 배열·마지막 원소·target 초과에서 무한 loop나 한 칸 오류가 난다.

### Backend 연결

cursor·timestamp·version 조회에서 첫 허용 위치를 찾을 때 boundary 의미를 API 계약으로 적는다. 테스트는 empty, all-less, all-greater, duplicate 입력을 각각 둔다.
