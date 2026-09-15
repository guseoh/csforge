---
kind: concept
contentKey: dsa.core.hashing.bucket-mapping
topicContentKey: dsa.core.hashing
slug: bucket-mapping
title: "Bucket Mapping"
summary: "hash value를 현재 table capacity 범위의 bucket index로 변환하고 resize가 mapping을 바꾸는 이유를 설명한다."
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

Hash function이 만든 값의 범위는 실제 hash table의 bucket 수보다 훨씬 클 수 있다. 그래서 table은 hash value를 현재 capacity 범위 `[0, capacity)`의 bucket 또는 initial slot index로 다시 매핑한다.

간단한 모델은 다음과 같다.

```text
h = hash(key)
index = normalize(h mod capacity)
```

언어의 remainder 규칙에 따라 음수 결과가 나올 수 있으므로 최종 index가 항상 유효한 범위가 되도록 정규화해야 한다. Capacity가 power of two인 구현에서는 bit mask를 사용할 수도 있지만, 이 경우에도 hash bit가 충분히 고르게 섞여 있다는 전제가 중요하다.

Bucket index는 key의 영구적인 속성이 아니다. 같은 hash value라도 capacity가 바뀌면 다른 index로 매핑될 수 있다.

```text
capacity 8  → h mod 8
capacity 16 → h mod 16
```

그래서 hash table resize에서는 기존 entry를 새 capacity 기준으로 다시 배치해야 한다. **Bucket mapping은 key hash와 현재 table shape를 연결하는 단계이며, collision 처리보다 앞서 후보 위치를 정하는 역할**을 한다.
