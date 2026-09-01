---
kind: concept
contentKey: dsa.core.hashing.hash-function
topicContentKey: dsa.core.hashing
slug: hash-function
title: "Hash Function"
summary: "key를 hash value로 투영하고 equality와 함께 hash table lookup을 구성하는 원리를 설명한다."
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

### 모든 key를 직접 비교하지 않고 후보 위치를 좁힌다

hash table이 빠른 lookup을 기대할 수 있는 출발점은 key 전체를 순서대로 훑지 않고 **key에서 계산한 hash value로 먼저 후보 위치를 좁히는 것**이다. hash function은 임의 크기의 key를 정해진 폭의 값으로 투영하고, table은 그 값을 다시 bucket 또는 slot 범위로 줄여 탐색 시작점을 정한다.

중요한 점은 hash value가 key의 identity 자체가 아니라는 것이다. 서로 다른 key가 같은 hash value나 같은 bucket을 가질 수 있으므로 최종 lookup에서는 실제 key equality를 확인해야 한다. `hash가 같다 = key가 같다`라고 처리하면 collision이 정상적으로 발생하는 순간 잘못된 값을 반환한다.

### 좋은 hash는 collision을 없애는 함수가 아니다

가능한 key 공간이 table slot 수보다 훨씬 크면 pigeonhole principle 때문에 collision은 피할 수 없다. 따라서 hash table용 hash의 목표는 collision을 0으로 만드는 것이 아니라 **실제 key distribution에서 특정 bucket이나 probe 구간에 값이 과도하게 몰리지 않도록 분산하는 것**이다.

예를 들어 table capacity가 8이고 hash가 key의 마지막 3bit만 사실상 사용한다면, 입력 key가 그 bit에서 비슷한 패턴을 가지는 경우 특정 bucket에 집중될 수 있다. hash function 자체와 bucket mapping 방식은 함께 봐야 한다.

```text
key
 │
 ▼
hash(key) = h
 │
 ▼
bucketIndex(h, capacity)
 │
 ▼
collision handling
 │
 ▼
key equality 확인
```

### equality와 hash 계약

같다고 판단되는 두 key는 lookup 과정에서 같은 후보 경로로 들어가야 한다. 반대로 hash가 같다고 해서 equality가 참일 필요는 없다. 따라서 hash 기반 collection에서는 **equality contract와 hash contract를 함께 유지**해야 한다.

저장 뒤 key의 equality/hash에 참여하는 값이 바뀌면 문제가 더 심각해진다. entry는 예전 hash를 기준으로 배치됐는데 lookup은 새 hash로 다른 bucket에서 시작할 수 있어, table 안에 값이 존재하면서도 찾지 못하는 상태가 생긴다. mutable key를 조심해야 하는 이유다.

### 자료구조용 hash와 암호학적 hash는 목적이 다르다

hash table은 빠른 계산과 적절한 분포가 중요하다. 반면 cryptographic hash는 preimage resistance나 collision resistance처럼 공격 모델에 대한 별도 보장을 요구한다. 빠르게 bucket을 고르는 함수가 곧 보안 식별자나 무결성 검증에 적합하다는 뜻은 아니다.

외부 입력을 hash table key로 직접 받는 경우에는 평균적인 분포뿐 아니라 공격자가 collision을 의도적으로 만들 수 있는지도 고려해야 한다. 여기서의 핵심은 특정 구현 이름을 외우는 것이 아니라 **hash 품질에 대한 가정이 깨지면 lookup 비용 가정도 함께 깨진다**는 점이다.
