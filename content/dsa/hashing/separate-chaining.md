---
kind: concept
contentKey: dsa.core.hashing.separate-chaining
topicContentKey: dsa.core.hashing
slug: separate-chaining
title: "분리 연결법(Separate Chaining)"
summary: "버킷마다 여러 항목을 저장해 충돌을 처리하고 버킷 내부 길이로 조회 비용을 추론한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "해시 함수, 분리 연결법·선형 탐사, 부하율과 검색 비용을 확인한다."
    displayOrder: 1
---
# 분리 연결법(Separate Chaining)

분리 연결법은 같은 버킷을 선택한 여러 항목을 그 버킷 안의 별도 자료구조에 함께 저장하는 충돌 처리 방식이다.

```text
버킷 0 → [K1]
버킷 1 → [K2] → [K7] → [K9]
버킷 2 → 비어 있음
```

조회할 때는 먼저 해시 값과 테이블 용량으로 버킷을 찾고, 그 안에서 실제 키를 비교한다. 따라서 버킷 선택 자체가 상수 시간이어도 한 버킷에 항목이 많이 몰리면 여러 키를 비교해야 한다.

저장된 항목 수를 `n`, 버킷 수를 `m`이라고 하면 부하율 `α = n / m`는 해시 값이 고르게 분포한다는 가정 아래 버킷마다 항목이 얼마나 모일지 생각하는 기준이 된다. 하지만 같은 부하율이라도 해시 분포가 좋지 않아 특정 버킷에 값이 몰리면 그 버킷의 조회 비용은 커질 수 있다.

삭제는 해당 버킷 안에서 항목을 제거하면 되므로 개방 주소법처럼 탐사 경로를 유지하기 위한 삭제 표시(tombstone)가 필요하지 않다. 대신 버킷마다 노드나 별도 자료구조를 사용하면 추가 메모리와 링크를 따라가는 비용이 생길 수 있다.

**분리 연결법의 핵심 상충 관계는 충돌된 항목을 유연하게 저장할 수 있는 대신 조회 비용이 버킷 내부 항목 수와 분포에 영향을 받는다는 점**이다.
