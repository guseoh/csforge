---
kind: concept
contentKey: dsa.core.hashing.load-factor
topicContentKey: dsa.core.hashing
slug: load-factor
title: "Load Factor"
summary: "entry 수와 bucket 수의 비율이 collision과 probe에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "평균 lookup과 worst-case collision을 비교한다."
    displayOrder: 1
---
# Load Factor

load factor는 보통 entry 수를 bucket 또는 slot 수로 나눈 값이다. chaining에서는 평균 chain 길이를, open addressing에서는 빈 slot과 probe 길이를 가늠하게 하므로 resize threshold의 핵심 기준이다.

낮은 load factor는 빠른 lookup을 주지만 더 많은 빈 공간과 cache footprint를 필요로 한다. threshold를 넘긴 순간 resize와 rehash가 일어나므로 평균 O(1)과 순간 pause를 함께 설명해야 한다.

### Backend 연결

cache key 수가 burst로 증가할 때 threshold·resize lock·allocation을 측정한다. 메모리 상한을 넘을 경우 eviction 또는 reject policy가 필요하며 무한 성장하지 않는다.
