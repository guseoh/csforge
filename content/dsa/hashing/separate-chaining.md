---
kind: concept
contentKey: dsa.core.hashing.separate-chaining
topicContentKey: dsa.core.hashing
slug: separate-chaining
title: "Separate Chaining"
summary: "bucket마다 여러 entry를 저장해 collision을 처리하고 chain 길이로 lookup 비용을 추론한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "separate chaining의 lookup/insert/delete와 chain length 비용을 확인한다."
    displayOrder: 1
---
# Separate Chaining

Separate chaining은 같은 bucket을 선택한 여러 entry를 그 bucket 안의 별도 collection에 함께 저장하는 collision 처리 방식이다.

```text
bucket 0 → [K1]
bucket 1 → [K2] → [K7] → [K9]
bucket 2 → empty
```

Lookup은 먼저 hash와 capacity로 bucket을 찾고, 그 안에서 실제 key equality를 확인한다. 따라서 bucket 선택 자체가 상수 시간이어도 chain이 길면 여러 key를 비교해야 한다.

Entry 수를 `n`, bucket 수를 `m`이라고 하면 load factor `α = n / m`는 균등한 분포를 가정할 때 평균 chain 길이를 생각하는 기준이 된다. 하지만 같은 load factor라도 hash 분포가 좋지 않아 한 bucket에 값이 몰리면 해당 bucket의 lookup 비용은 커질 수 있다.

삭제는 bucket 내부 collection에서 entry를 제거하면 되므로 open addressing처럼 probe path를 유지하기 위한 tombstone이 필요하지 않다. 대신 bucket마다 node나 별도 collection을 사용하면 추가 memory와 pointer traversal 비용이 생길 수 있다.

**Separate chaining의 핵심 trade-off는 collision을 유연하게 저장할 수 있는 대신, lookup 비용이 bucket 내부 entry 수에 의존한다는 것**이다.
