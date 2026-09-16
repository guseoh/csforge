---
kind: concept
contentKey: dsa.core.algorithm-selection.data-shape
topicContentKey: dsa.core.algorithm-selection
slug: data-shape
title: "Data Shape"
summary: "정렬·중복·범위·분포가 선택을 바꾸는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Data Shape

입력 크기 n이 같아도 데이터의 구조적 성질이 다르면 좋은 알고리즘이 달라진다. 이미 정렬되어 있는지, 중복이 많은지, key 범위가 제한되어 있는지, graph가 sparse한지 dense한지 같은 조건이 알고리즘의 전제와 비용을 바꾼다.

이미 정렬된 배열에서는 binary search를 사용할 수 있지만 정렬되지 않은 데이터라면 먼저 정렬 비용을 지불해야 한다. Key 범위가 충분히 작다면 counting sort처럼 comparison을 사용하지 않는 알고리즘도 후보가 될 수 있다.

중복 분포도 중요하다. Duplicate가 많은 quicksort에서는 equal key 처리 방식이 분할 품질에 영향을 줄 수 있고, hash table에서는 특정 bucket으로 key가 몰리면 expected lookup 비용이 악화될 수 있다.

Graph에서는 vertex와 edge 수의 관계가 representation 선택에 영향을 준다. Sparse graph는 adjacency list가 자연스럽고, vertex 수가 작고 edge 존재 확인이 잦은 dense graph에서는 matrix가 후보가 될 수 있다.

따라서 `n` 하나만으로 알고리즘을 선택하지 않는다. **정렬 여부, 중복, key 범위, 분포와 graph density처럼 실제로 보장되는 data shape**를 함께 확인해야 한다.
