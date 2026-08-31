---
kind: concept
contentKey: dsa.core.search-sort.stable-sort
topicContentKey: dsa.core.search-sort
slug: stable-sort
title: "Stable Sort"
summary: "동일 key의 상대 순서를 보존하는 안정성의 의미와 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "comparison sort의 decision-tree 하한을 확인한다."
    displayOrder: 1
---
# Stable Sort

stable sort는 비교 key가 같은 원소의 원래 상대 순서를 보존한다. 먼저 time으로 정렬하고 다시 priority로 stable sort하면 같은 priority 안에서 time 순서가 유지되어 다중 기준 정렬을 단계적으로 구성할 수 있다.

unstable sort는 더 적은 memory나 빠른 partition을 제공할 수 있지만 equal key의 순서를 보장하지 않는다. comparator가 동치라고 판단한 원소의 identity가 결과에 중요하면 stable 여부와 tie-breaker를 명시해야 한다.

### Backend 연결

목록 API의 deterministic ordering과 pagination에서 stable sort가 중요하다. 동일 sort key에 unique ID tie-breaker를 추가하지 않으면 page 사이에 item이 이동할 수 있다.
