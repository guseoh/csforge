---
kind: concept
contentKey: dsa.core.hashing.average-worst-lookup
topicContentKey: dsa.core.hashing
slug: average-worst-lookup
title: "Average and Worst Lookup"
summary: "평균 O(1) 기대와 adversarial worst case의 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "평균 lookup과 worst-case collision을 비교한다."
    displayOrder: 1
---
# Average and Worst Lookup

균등한 hash 분포와 적절한 load factor를 가정하면 lookup은 평균 O(1)로 기대할 수 있다. 이는 모든 key에 대한 상한이 아니며, 나쁜 hash·높은 load·공격자가 만든 collision에서는 chain 또는 probe가 O(n)이 될 수 있다.

평균 분석은 key distribution과 resize policy를 전제로 한다. p99를 보장해야 하는 서비스는 bucket 길이, probe 횟수, hash randomization과 reject/rehash 비용을 함께 관찰해야 한다.

### Backend 연결

user-controlled cache key나 dedup map을 외부 요청 경로에 둘 때 adversarial input을 부하 테스트한다. 평균 O(1)을 timeout과 capacity의 hard guarantee로 문서화하지 않는다.

