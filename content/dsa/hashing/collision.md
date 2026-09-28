---
kind: concept
contentKey: dsa.core.hashing.collision
topicContentKey: dsa.core.hashing
slug: collision
title: "충돌(Collision)"
summary: "서로 다른 key가 같은 candidate 위치를 선택할 때 충돌 strategy와 equality로 정확성을 유지하는 원리를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "해시 함수, separate chaining·linear probing, 부하율과 검색 비용을 확인한다."
    displayOrder: 1
---
# 충돌(Collision)

서로 다른 key가 같은 해시 값나 같은 버킷/슬롯 후보를 선택하는 현상을 충돌이라고 한다. 제한된 수의 저장 위치에 더 큰 key 공간을 매핑하기 때문에 일반적인 해시 테이블에서는 충돌이 정상적으로 발생할 수 있다.

```text
key A ─┐
       ├─> bucket 3
key B ─┘
```

충돌이 발생했다고 둘 중 하나를 버릴 수는 없다. 해시 테이블은 같은 후보 위치에 여러 key가 있다는 전제 아래 실제 key equality를 검사하면서 원하는 entry를 찾아야 한다.

대표적인 해결 방식은 두 가지다. Separate chaining은 한 버킷 안에 여러 entry를 저장하고, open addressing은 테이블 내부의 다른 슬롯을 probe한다. 방식은 달라도 목적은 **같은 후보 위치를 공유한 여러 key를 잃지 않고 다시 찾을 수 있는 탐색 경로를 유지하는 것**이다.

충돌이 많아지면 한 조회에서 비교해야 하는 후보가 늘어난다. 그래서 hash distribution, 부하율과 충돌 strategy가 함께 조회 비용을 결정한다. 충돌 자체는 오류가 아니며, 충돌을 제대로 처리하지 못하는 것이 자료구조의 오류다.
