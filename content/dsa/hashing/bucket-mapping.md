---
kind: concept
contentKey: dsa.core.hashing.bucket-mapping
topicContentKey: dsa.core.hashing
slug: bucket-mapping
title: "Bucket Mapping"
summary: "hash value에서 bucket index를 계산하고 범위·음수 전제를 처리한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "평균 lookup과 worst-case collision을 비교한다."
    displayOrder: 1
---
# Bucket Mapping

bucket index는 보통 hash value를 table capacity로 나눈 나머지나 bit mask로 계산한다. capacity가 power of two이면 mask가 빠르지만 hash의 낮은 bit가 나쁘면 충돌이 몰릴 수 있고, 음수 remainder는 언어 규칙에 맞게 정규화해야 한다.

resize 뒤에는 capacity가 바뀌어 같은 key의 index가 달라질 수 있다. index만 보관하고 hash나 key를 버리면 rehash와 equality 검사가 불가능해진다.

### Backend 연결

partition key와 local cache bucket을 설계할 때 분포·capacity·resize 시점을 함께 테스트한다. hash 값과 보안 식별자를 같은 값으로 노출하지 않는다.
