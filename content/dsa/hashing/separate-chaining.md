---
kind: concept
contentKey: dsa.core.hashing.separate-chaining
topicContentKey: dsa.core.hashing
slug: separate-chaining
title: "Separate Chaining"
summary: "bucket마다 여러 entry를 연결해 collision을 처리하고 chain 길이와 load factor로 비용을 추론한다."
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

### 하나의 bucket에 여러 key를 보관한다

separate chaining은 collision이 발생했을 때 entry를 버리거나 다른 table slot을 찾지 않고, 각 bucket에 작은 collection을 두어 같은 bucket을 선택한 key들을 함께 저장한다.

```text
bucket 0 → [K1]
bucket 1 → [K2] → [K7] → [K9]
bucket 2 → empty
```

lookup은 먼저 hash와 capacity로 bucket을 찾고, 그 bucket 안에서 실제 key equality를 검사한다. bucket 하나를 찾는 계산이 O(1)이어도 chain 안에 entry가 여러 개면 그만큼 추가 비교가 필요하다.

### operation의 비용은 bucket 길이에 달려 있다

insert는 새 entry를 bucket collection에 추가하고, lookup/delete는 해당 bucket에서 같은 key를 찾아야 한다. 균등하게 분산된다는 가정 아래 entry 수 `n`, bucket 수 `m`이면 load factor `α = n/m`가 평균 chain length의 직관적인 기준이 된다.

하지만 평균값만으로 최장 chain을 숨길 수 있다. 대부분 bucket이 짧아도 하나의 bucket에 많은 key가 몰리면 해당 key의 lookup은 길어지고 tail latency가 커질 수 있다.

### 삭제가 단순한 대신 pointer와 locality 비용을 낸다

chaining은 open addressing처럼 probe chain 유지를 위해 tombstone을 둘 필요가 없다. bucket collection에서 entry를 제거하면 된다. 대신 linked node나 별도 collection을 사용하면 pointer/object metadata와 allocation overhead가 생길 수 있고, entry가 memory에 흩어져 cache locality도 나빠질 수 있다.

따라서 `collision 처리가 쉽다`는 장점과 `extra indirection + allocation` 비용을 같이 봐야 한다.

### 높은 load factor를 무조건 허용해도 되는 것은 아니다

chaining은 slot 수보다 많은 entry를 저장할 수 있어 load factor가 1을 넘을 수도 있다. 하지만 저장 가능하다는 것과 lookup 비용이 유지된다는 것은 다르다. chain이 계속 길어지면 resize로 bucket 수를 늘리는 편이 유리할 수 있다.

서비스에서 평균 lookup만 측정하지 않고 bucket length distribution이나 p95/p99 probe/compare count까지 보는 이유도 여기에 있다.
