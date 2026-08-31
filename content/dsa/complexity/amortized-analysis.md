---
kind: concept
contentKey: dsa.core.complexity.amortized-analysis
topicContentKey: dsa.core.complexity
slug: amortized-analysis
title: "Amortized Analysis"
summary: "한 번 비싼 연산을 전체 sequence 평균 비용으로 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Amortized Analysis

dynamic array append는 capacity가 찬 순간 `n`개를 복사해 비싸지만, capacity를 배수로 늘리면 그 복사 비용이 많은 cheap append에 분산되어 sequence 전체 평균은 O(1)이 된다. amortized bound는 각 연산이 individually O(1)이라는 뜻이 아니라 prefix sequence의 총 비용을 제한한다는 뜻이다.

aggregate, accounting, potential method는 같은 보장을 다른 방식으로 보인다. capacity 증가율이 너무 작으면 resize가 잦고 너무 크면 unused memory가 커지므로 growth policy와 실제 allocator 비용을 함께 본다.

### Backend 연결

batch buffer·retry queue·event accumulator의 append 비용을 측정할 때 평균만 보고 순간 pause를 숨기지 않는다. capacity 예약은 memory budget과 burst latency를 함께 고려한다.
