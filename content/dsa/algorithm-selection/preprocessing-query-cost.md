---
kind: concept
contentKey: dsa.core.algorithm-selection.preprocessing-query-cost
topicContentKey: dsa.core.algorithm-selection
slug: preprocessing-query-cost
title: "Preprocessing and Query Cost"
summary: "초기 전처리 비용과 반복 query 비용의 합을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Preprocessing and Query Cost

index나 정렬 같은 preprocessing은 처음 비용을 지불하고 이후 query를 빠르게 한다. 총 비용은 전처리 비용과 query 횟수에 따른 반복 비용, 갱신 비용의 합으로 비교해야 한다.

read가 많고 data가 안정적이면 preprocessing이 유리하지만, write가 잦거나 한 번만 조회하면 overhead가 된다. stale index와 rebuild 시점도 correctness와 availability의 일부다.

### Backend 연결

PostgreSQL index와 Elasticsearch projection은 쓰기·rebuild 비용을 가진다. canonical DB 변경과 검색 query latency의 trade-off를 측정하고 파생 index를 복구 가능하게 한다.

