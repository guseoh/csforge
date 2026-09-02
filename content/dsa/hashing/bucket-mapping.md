---
kind: concept
contentKey: dsa.core.hashing.bucket-mapping
topicContentKey: dsa.core.hashing
slug: bucket-mapping
title: "Bucket Mapping"
summary: "hash value를 현재 table capacity의 bucket index로 줄이는 계산과 resize 영향을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "separate chaining의 lookup/insert/delete와 chain length 비용을 확인한다."
    displayOrder: 1
---
# Bucket Mapping

### hash value와 bucket index는 같은 것이 아니다

hash function이 만든 값의 범위는 table의 bucket 수보다 훨씬 클 수 있다. 따라서 hash table은 `hash(key)`를 그대로 array index로 사용하지 않고, 현재 capacity 범위 `[0, capacity)` 안의 bucket index로 다시 줄인다.

가장 단순한 모델은 다음과 같다.

```text
h = hash(key)
index = normalized(h mod capacity)
```

capacity가 16이면 최종 index는 0부터 15 사이여야 한다. 언어에 따라 음수 정수의 remainder 규칙이 다를 수 있으므로 raw hash를 그대로 `% capacity`한 결과가 항상 유효한 non-negative index라고 가정해서는 안 된다.

### power-of-two capacity와 bit 사용

capacity가 `2^k`이면 하위 k bit를 mask로 사용하는 식으로 index를 계산할 수 있다. 계산은 단순하지만 hash의 특정 bit가 실제 key distribution을 잘 섞지 못하면 bucket 편향이 커질 수 있다. 그래서 일부 구현은 raw hash를 바로 쓰지 않고 bit mixing을 추가하기도 한다.

핵심은 `%`와 bit mask 중 어느 하나를 외우는 것이 아니라 **bucket mapping은 hash function의 분포와 capacity 선택에 의존한다**는 점이다.

### resize하면 같은 key의 bucket도 달라질 수 있다

capacity 8일 때 `h mod 8 = 3`이었던 key가 capacity 16에서는 `h mod 16 = 11`이 될 수 있다. 즉 bucket index는 key에 영구적으로 붙는 identity가 아니라 **현재 table shape의 함수**다.

```text
old capacity = 8   → index = h mod 8
new capacity = 16  → index = h mod 16
```

따라서 resize하면서 old bucket number만 복사하면 lookup invariant가 깨질 수 있다. 기존 key를 새 capacity 기준으로 다시 mapping해야 하는 이유가 여기 있다.

### partitioning과는 같은 개념이 아니다

backend에서 `hash(key) % N` 형태를 partition 선택에 쓰기도 하지만, process-local hash table의 bucket mapping과 distributed partition assignment는 동일한 책임이 아니다. node 증감, replication, failover 같은 분산 시스템 문제는 별도다. 여기서는 **하나의 hash table 내부에서 candidate bucket을 정하는 계산**에 집중한다.
