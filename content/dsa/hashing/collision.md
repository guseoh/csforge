---
kind: concept
contentKey: dsa.core.hashing.collision
topicContentKey: dsa.core.hashing
slug: collision
title: "Collision"
summary: "서로 다른 key가 같은 candidate 위치를 공유할 때 equality와 collision strategy로 correctness를 유지하는 원리를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "separate chaining의 lookup/insert/delete와 chain length 비용을 확인한다."
    displayOrder: 1
---
# Collision

### collision은 예외 상황이 아니라 hash table의 기본 전제다

서로 다른 key를 제한된 수의 bucket이나 slot으로 줄이면 같은 candidate 위치를 선택하는 key가 생긴다. 이를 collision이라고 한다. 좋은 hash function은 collision이 특정 위치에 과도하게 몰릴 가능성을 줄이지만, 일반적인 hash table에서 collision 자체를 없애지는 못한다.

예를 들어 capacity가 8인 table에서 서로 다른 key `A`, `B`의 bucket index가 모두 3일 수 있다.

```text
A ──hash/map──▶ bucket 3
B ──hash/map──▶ bucket 3
```

이때 table이 `bucket 3에는 A가 있으니 B는 저장할 수 없다`고 하면 자료구조로서 쓸 수 없다. collision을 보존하면서도 실제 key를 구분하는 별도 규칙이 필요하다.

### hash 비교는 후보를 줄이고 equality가 정답을 확정한다

lookup은 보통 `hash → candidate 위치 → collision path → equality` 순서로 진행한다. hash가 다르면 빠르게 다른 후보로 갈 수 있지만 hash가 같거나 bucket이 같을 때는 실제 key equality를 확인해야 한다.

따라서 다음 두 명제는 다르다.

```text
same key  → hash contract에 따라 같은 lookup path가 필요
same hash → same key라는 보장은 없음
```

hash만 비교해서 값을 반환하면 collision 순간 잘못된 entry를 반환한다. 반대로 collision을 정상적으로 처리하는 table에서는 같은 bucket에 여러 서로 다른 key가 존재해도 correctness가 깨지지 않는다.

### collision strategy가 lookup state를 결정한다

대표적인 두 방식은 separate chaining과 open addressing이다. chaining은 같은 bucket에 여러 entry를 연결해 두고 그 collection 안을 검사한다. open addressing은 table의 다른 slot으로 probe를 이어 간다.

두 방식 모두 결국 **후보가 여러 개일 때 실제 key를 찾을 때까지 어떤 경로를 따라갈 것인가**를 정의한다. load factor가 높거나 분포가 나쁘면 그 경로가 길어져 평균 O(1) 기대가 약해진다.

### collision과 domain duplicate는 다른 문제다

hash collision은 서로 다른 key가 내부 자료구조에서 같은 후보 위치를 고르는 정상적인 현상이다. 반면 동일한 canonical contentKey가 두 번 들어오는 것은 domain uniqueness 위반일 수 있다. 둘을 섞으면 자료구조 내부 충돌을 DB unique constraint 문제로 오해하거나 그 반대의 잘못된 처리를 만들 수 있다.
