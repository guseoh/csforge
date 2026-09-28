---
kind: concept
contentKey: dsa.core.hashing.open-addressing
topicContentKey: dsa.core.hashing
slug: open-addressing
title: "개방 주소법(Open Addressing)"
summary: "충돌 시 테이블 내부 슬롯을 probe하고 삭제 후에도 탐색 경로를 유지하는 tombstone 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "해시 함수, separate chaining·linear probing, 부하율과 검색 비용을 확인한다."
    displayOrder: 1
---
# 개방 주소법(Open Addressing)

Open addressing은 별도의 버킷 collection을 두지 않고 모든 entry를 테이블의 슬롯 안에 직접 저장한다. 첫 후보 슬롯이 이미 다른 key로 차 있으면 정해진 probe sequence를 따라 다음 슬롯을 찾는다.

```text
initial slot occupied
      ↓
probe 1 → probe 2 → probe 3 → ...
```

Linear probing, quadratic probing, double hashing처럼 다음 후보를 정하는 방식은 다를 수 있지만 insert와 조회는 같은 probe 규칙을 사용해야 한다.

조회는 대상을 찾거나 **이 probe 경로에 어떤 entry도 들어온 적이 없음을 뜻하는 truly empty 슬롯**을 만날 때까지 계속한다. 이 때문에 삭제한 슬롯을 단순 empty로 바꾸면 뒤쪽에 저장된 key를 찾지 못할 수 있다.

그래서 삭제된 위치에 tombstone 같은 `DELETED` 상태를 남길 수 있다. 조회는 tombstone을 지나 계속 probe하고, insert는 그 위치를 재사용할 수 있다.

테이블이 많이 찰수록 빈 슬롯을 찾기 위한 probe가 길어지고 clustering도 커질 수 있다. **Open addressing의 핵심은 충돌 경로를 테이블 내부에 유지하는 대신 occupancy와 삭제 상태가 조회 길이에 직접 영향을 준다는 것**이다.
