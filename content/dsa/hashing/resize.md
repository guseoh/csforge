---
kind: concept
contentKey: dsa.core.hashing.resize
topicContentKey: dsa.core.hashing
slug: resize
title: "Hash Table Resize"
summary: "capacity 변경이 bucket mapping을 바꾸기 때문에 entry를 재배치해야 하는 이유와 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "table resize와 rehash가 insertion sequence 비용에 미치는 영향을 확인한다."
    displayOrder: 1
---
# Hash Table Resize

### capacity가 바뀌면 bucket mapping도 바뀐다

hash table의 bucket index는 key만의 함수가 아니라 보통 `hash(key)`와 현재 capacity의 함수다. 따라서 capacity를 8에서 16으로 늘리면 기존 key가 같은 bucket에 남는다고 보장할 수 없다.

```text
old: index = h mod 8
new: index = h mod 16
```

old table의 bucket 번호만 그대로 복사하면 새 lookup은 다른 index에서 key를 찾으려 할 수 있다. 그래서 resize는 단순한 array copy가 아니라 **각 live entry를 새 table 규칙으로 다시 배치하는 rehash/reinsert 과정**이 된다.

### resize의 순간 비용은 O(n)이 될 수 있다

일반적인 eager resize는 더 큰 table을 할당하고 기존 n개 entry를 순회해 새 위치에 넣은 뒤, 모든 entry가 정상적으로 옮겨졌을 때 새 table을 현재 table로 전환한다.

```text
allocate new table
      ↓
for each live entry
  recompute bucket/probe
  insert into new table
      ↓
publish new table
      ↓
release old table
```

따라서 resize가 발생한 한 번의 insert는 비쌀 수 있다. 그러나 capacity를 충분한 비율로 늘린다면 resize가 매 insert마다 발생하지 않아 sequence 전체에서는 amortized cost로 설명할 수 있다.

### peak memory와 failure boundary가 있다

migration 중에는 old table과 new table이 동시에 존재할 수 있어 peak memory가 평상시 table size보다 커진다. 큰 table에서 이 순간 allocation이 실패하면 현재 table을 잃지 않고 기존 상태를 계속 사용할 수 있어야 한다.

동시 접근이 있다면 더 복잡하다. 어떤 reader가 old table을 보고 어떤 reader가 new table을 보는지, insert가 migration 중 어느 쪽에 반영되는지에 대한 synchronization/version rule이 필요하다. 이 문제는 hash table 자체의 기본 원리와 concurrent map 구현의 별도 문제를 구분해 봐야 한다.

### incremental resize는 pause와 lookup 복잡도를 교환한다

모든 entry를 한 번에 옮기면 큰 pause가 생길 수 있다. 이를 줄이기 위해 일부 구현은 operation마다 몇 bucket씩 새 table로 옮기는 incremental migration을 사용할 수 있다. 대신 migration이 끝날 때까지 lookup이 old/new table 모두를 확인하거나 migration state를 따라야 해 구현 복잡도가 증가한다.

따라서 resize policy는 단순한 capacity 숫자가 아니라 **평균 비용, 단일-operation tail latency, peak memory, migration complexity**의 trade-off다.
