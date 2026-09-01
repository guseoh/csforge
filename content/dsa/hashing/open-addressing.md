---
kind: concept
contentKey: dsa.core.hashing.open-addressing
topicContentKey: dsa.core.hashing
slug: open-addressing
title: "Open Addressing"
summary: "collision 시 table 내부 slot을 probe하고 tombstone으로 lookup path를 보존하는 원리를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "linear probing을 포함한 open addressing의 probe와 삭제 조건을 확인한다."
    displayOrder: 1
---
# Open Addressing

### collision이 나면 같은 table 안에서 다음 후보를 찾는다

open addressing은 별도의 bucket list를 만들지 않고 모든 entry를 table의 slot에 직접 저장한다. hash가 가리킨 첫 slot이 이미 다른 key로 차 있으면 정해진 probe sequence를 따라 다음 후보를 찾는다.

```text
initial index = h(key)
      │ occupied by another key
      ▼
probe 1 → probe 2 → probe 3 → ...
```

linear probing은 인접 slot을 순서대로 보고, quadratic probing이나 double hashing은 다른 규칙으로 다음 후보를 계산한다. 중요한 것은 insert와 lookup이 **같은 probe 규칙**을 따라야 한다는 점이다.

### lookup은 truly empty slot을 만나기 전까지 이어진다

찾는 key가 initial slot에 없다고 바로 miss로 결론내리면 안 된다. 그 key가 과거 collision 때문에 뒤쪽 slot에 저장됐을 수 있기 때문이다. lookup은 probe sequence를 따라 equality를 검사하다가 key를 찾거나, 해당 probe path에 entry가 존재한 적이 없음을 뜻하는 truly empty slot을 만나야 멈출 수 있다.

이 성질 때문에 삭제가 까다롭다.

### 삭제한 slot을 그냥 empty로 바꾸면 probe chain이 끊긴다

다음 상태를 보자.

```text
slot 3 : A
slot 4 : B   ← A와 collision 후 여기에 저장됨
slot 5 : C   ← 같은 probe cluster
```

slot 3의 A를 삭제하면서 바로 `EMPTY`로 표시하면, B를 찾는 lookup이 slot 3에서 `아무도 저장된 적 없음`이라고 오해하고 종료할 수 있다. 그래서 삭제된 자리에는 `DELETED` 또는 tombstone 같은 상태를 남겨 lookup은 계속 진행하되 새 insert가 그 자리를 재사용할 수 있게 한다.

즉 open addressing의 slot은 단순히 `occupied / empty` 두 상태만으로 충분하지 않을 수 있다.

### 높은 load factor와 tombstone은 probe를 길게 만든다

slot이 차 있을수록 새 key가 빈 자리를 찾기 어렵고 lookup도 더 많은 candidate를 비교한다. linear probing에서는 인접한 occupied 구간이 커지는 clustering도 문제다. tombstone이 많이 남아도 lookup은 그 자리를 건너 계속 probe해야 하므로 실제 live entry 수가 줄었는데도 비용이 높을 수 있다.

따라서 open addressing은 load-factor threshold와 resize/rehash 정책, tombstone cleanup을 함께 설계한다. chaining보다 memory locality가 좋아질 여지가 있지만 높은 occupancy에서 성능이 급격히 악화될 수 있다는 trade-off가 있다.
