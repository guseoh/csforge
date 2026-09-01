---
kind: concept
contentKey: dsa.core.search-sort.comparison-sort-lower-bound
topicContentKey: dsa.core.search-sort
slug: comparison-sort-lower-bound
title: "Comparison Sort Lower Bound"
summary: "comparison decision tree가 Ω(n log n)을 제한하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "comparison sort의 decision-tree 하한을 확인한다."
    displayOrder: 1
---
# Comparison Sort Lower Bound

comparison sort는 두 원소의 대소를 물어 얻은 결과로 순열 후보를 줄인다. n개의 서로 다른 원소 순서는 n!가지이고 binary decision tree의 leaf 수가 이를 구분해야 하므로 최악 깊이는 Ω(log n!) = Ω(n log n)이다.

이 하한은 key의 실제 범위나 bit를 사용하지 않는 비교 모델의 주장이다. counting·radix sort가 이를 위반하는 것처럼 보이는 이유는 key 범위와 표현을 추가 정보로 사용하기 때문이다.

### Backend 연결

정렬을 선택할 때 comparator만 가능한지, bounded integer key인지 확인한다. 큰 데이터에서는 comparison 비용과 memory bandwidth·external storage 비용도 함께 계산한다.
