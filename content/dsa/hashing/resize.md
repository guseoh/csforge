---
kind: concept
contentKey: dsa.core.hashing.resize
topicContentKey: dsa.core.hashing
slug: resize
title: "Hash Table Resize"
summary: "capacity 변경이 bucket mapping을 바꾸기 때문에 live entry를 새 table에 다시 배치해야 하는 이유와 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "separate chaining의 lookup/insert/delete와 chain length 비용을 확인한다."
    displayOrder: 1
---
# Hash Table Resize

Hash table의 bucket이나 slot 위치는 보통 hash value와 현재 capacity를 함께 사용해 계산한다. 따라서 capacity가 바뀌면 같은 key도 다른 위치로 매핑될 수 있다.

```text
old capacity = 8  → index = map(h, 8)
new capacity = 16 → index = map(h, 16)
```

그래서 resize는 backing array를 단순히 더 큰 공간에 복사하는 작업이 아니다. 새 table을 만든 뒤 각 live entry를 새 capacity 기준으로 다시 bucket 또는 probe sequence에 배치해야 한다.

```text
allocate new table
      ↓
for each live entry
  recompute location
  insert into new table
      ↓
replace old table
```

Entry가 `n`개라면 한 번의 eager resize는 `O(n)` 비용이 들 수 있다. 하지만 capacity를 일정 비율로 늘려 resize 빈도를 충분히 낮추면 insert sequence 전체에서는 amortized 비용으로 분산할 수 있다.

Resize 중에는 old table과 new table이 동시에 필요해 순간 memory 사용도 증가할 수 있다. **Resize의 핵심은 load factor를 낮춰 이후 operation 비용을 줄이는 대신, 가끔 모든 entry를 재배치하는 큰 비용을 지불하는 것**이다.
