---
kind: concept
contentKey: dsa.core.hashing.hash-function
topicContentKey: dsa.core.hashing
slug: hash-function
title: "해시 함수(Hash Function)"
summary: "키를 해시 값으로 변환해 후보 위치를 좁히고 실제 키 비교와 함께 조회를 구성하는 원리를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "해시 함수, 분리 연결법·선형 탐사, 부하율과 검색 비용을 확인한다."
    displayOrder: 1
---
# 해시 함수(Hash Function)

해시 함수는 키를 정해진 폭의 해시 값으로 변환해 해시 테이블이 탐색할 후보 위치를 빠르게 좁히게 한다. 테이블은 이 해시 값을 현재 버킷 또는 슬롯 범위에 맞는 위치로 다시 대응시킨 뒤 실제 키를 찾는다.

```text
키 → 해시 값 → 버킷/슬롯 후보 → 실제 키 비교
```

해시 값은 키의 고유한 식별자가 아니다. 서로 다른 키가 같은 해시 값이나 같은 버킷을 가질 수 있으므로 최종 조회에서는 실제 키의 동등성을 확인해야 한다. `같은 해시 값 = 같은 키`로 처리하면 충돌이 발생하는 순간 정확성이 깨진다.

가능한 키의 수가 버킷 수보다 훨씬 많기 때문에 충돌은 일반적으로 피할 수 없다. 좋은 해시 함수의 목표는 충돌을 완전히 없애는 것이 아니라 실제 키가 일부 버킷에 과도하게 몰리지 않도록 충분히 분산시키는 것이다.

또한 동등성 기준으로 같은 두 키는 해시 기반 조회에서 같은 후보 경로에 들어갈 수 있도록 일관된 해시 값을 가져야 한다. 저장한 뒤 동등성이나 해시 계산에 참여하는 키 상태를 바꾸면 항목은 기존 위치에 남아 있는데 조회는 다른 위치에서 시작하는 문제가 생길 수 있다.

자료구조용 해시는 빠른 계산과 적절한 분산이 핵심이며 암호학적 해시(cryptographic hash)가 요구하는 공격 저항성과는 목적이 다르다. **해시 테이블에서 해시 함수의 역할은 키를 확정하는 것이 아니라 검색 범위를 좁히는 것**이다.
