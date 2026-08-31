---
kind: concept
contentKey: dsa.core.hashing.hash-function
topicContentKey: dsa.core.hashing
slug: hash-function
title: "Hash Function"
summary: "key를 비교 가능한 hash value로 투영하는 목적과 분포를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "평균 lookup과 worst-case collision을 비교한다."
    displayOrder: 1
---
# Hash Function

hash function은 key를 고정 폭 hash value로 매핑해 전체 key를 순서대로 비교하지 않고 후보 bucket을 찾게 한다. 좋은 분포는 서로 다른 key가 bucket에 고르게 놓이게 하지만 collision을 완전히 없애지는 못한다.

hash table용 hash와 암호학적 hash는 요구사항이 다르다. 빠른 분산 함수가 collision resistance를 제공한다는 보장은 없고, key가 mutable이면 저장 후 hash가 바뀌어 entry를 찾지 못할 수 있다.

### Backend 연결

cache key와 in-memory index에서 equality·hash 계약과 key lifetime을 고정한다. 사용자 입력이 hash table을 의도적으로 한 bucket에 몰 수 있으면 worst-case와 방어 정책을 검토한다.
