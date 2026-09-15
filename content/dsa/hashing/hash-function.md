---
kind: concept
contentKey: dsa.core.hashing.hash-function
topicContentKey: dsa.core.hashing
slug: hash-function
title: "Hash Function"
summary: "key를 hash value로 투영해 후보 위치를 좁히고 equality와 함께 lookup을 구성하는 원리를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "separate chaining의 lookup/insert/delete와 chain length 비용을 확인한다."
    displayOrder: 1
---
# Hash Function

Hash function은 key를 정해진 폭의 hash value로 변환해 hash table이 탐색할 후보 위치를 빠르게 좁히게 한다. Table은 이 hash value를 현재 bucket 또는 slot 범위로 다시 매핑한 뒤 실제 key를 찾는다.

```text
key → hash value → bucket/slot 후보 → equality 확인
```

Hash value는 key의 고유 identity가 아니다. 서로 다른 key가 같은 hash value나 같은 bucket을 가질 수 있으므로 최종 lookup에서는 실제 key equality를 확인해야 한다. `같은 hash = 같은 key`로 처리하면 collision이 발생하는 순간 correctness가 깨진다.

가능한 key의 수가 bucket 수보다 훨씬 많기 때문에 collision은 일반적으로 피할 수 없다. 좋은 hash function의 목표는 collision을 완전히 없애는 것이 아니라 실제 key들이 일부 bucket에 과도하게 몰리지 않도록 충분히 분산시키는 것이다.

또한 equality 기준으로 같은 두 key는 hash 기반 lookup에서 같은 후보 경로에 들어갈 수 있도록 일관된 hash를 가져야 한다. 저장 후 equality/hash 계산에 참여하는 key 상태를 바꾸면 entry가 기존 위치에 남아 있는데 lookup은 다른 위치에서 시작하는 문제가 생길 수 있다.

자료구조용 hash는 빠른 계산과 분산이 핵심이며 cryptographic hash가 요구하는 공격 저항성과는 목적이 다르다. **Hash table에서 hash function의 역할은 key를 확정하는 것이 아니라 검색 범위를 좁히는 것**이다.
