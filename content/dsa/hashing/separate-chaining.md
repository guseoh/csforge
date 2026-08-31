---
kind: concept
contentKey: dsa.core.hashing.separate-chaining
topicContentKey: dsa.core.hashing
slug: separate-chaining
title: "Separate Chaining"
summary: "bucket 내부 collection으로 collision을 처리하는 비용과 삭제를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "평균 lookup과 worst-case collision을 비교한다."
    displayOrder: 1
---
# Separate Chaining

separate chaining은 각 bucket에 list나 작은 collection을 두고 같은 index의 entry를 그 안에 연결한다. insert는 bucket에 추가하고 lookup/delete는 hash index 뒤에서 equality를 검사한다. load factor가 평균 chain 길이를 결정한다.

장점은 table이 가득 차도 chain으로 저장할 수 있고 삭제가 단순하다는 점이다. 대신 pointer·object overhead와 cache locality 저하가 있으며, adversarial collision 하나가 긴 chain과 tail latency를 만든다.

### Backend 연결

in-memory map의 p99 lookup을 해석할 때 평균 load factor와 최장 bucket을 함께 기록한다. immutable key와 삭제 후 memory 회수도 자료구조 계약에 포함한다.
