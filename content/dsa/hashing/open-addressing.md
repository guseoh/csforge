---
kind: concept
contentKey: dsa.core.hashing.open-addressing
topicContentKey: dsa.core.hashing
slug: open-addressing
title: "개방 주소법(Open Addressing)"
summary: "충돌 시 테이블 내부 슬롯을 탐사하고 삭제 후에도 탐색 경로를 유지하는 삭제 표시 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "해시 함수, 분리 연결법·선형 탐사, 부하율과 검색 비용을 확인한다."
    displayOrder: 1
---
# 개방 주소법(Open Addressing)

개방 주소법은 별도의 버킷 자료구조를 두지 않고 모든 항목을 테이블의 슬롯 안에 직접 저장한다. 첫 후보 슬롯이 이미 다른 키로 차 있으면 정해진 탐사 순서에 따라 다음 슬롯을 찾는다.

```text
첫 후보 슬롯이 사용 중
        ↓
탐사 1 → 탐사 2 → 탐사 3 → ...
```

선형 탐사(linear probing), 이차 탐사(quadratic probing), 이중 해싱(double hashing)처럼 다음 후보를 정하는 방식은 다를 수 있지만 삽입과 조회는 같은 탐사 규칙을 사용해야 한다.

조회는 대상을 찾거나 **이 탐사 경로에 어떤 항목도 저장된 적이 없음을 뜻하는 완전히 빈 슬롯**을 만날 때까지 계속한다. 이 때문에 삭제한 슬롯을 단순히 빈 슬롯으로 바꾸면 그 뒤에 저장된 키를 찾지 못할 수 있다.

그래서 삭제된 위치에 삭제 표시(tombstone) 같은 `DELETED` 상태를 남길 수 있다. 조회는 이 표시를 지나 계속 탐사하고, 삽입은 해당 위치를 다시 사용할 수 있다.

테이블이 많이 찰수록 빈 슬롯을 찾기 위한 탐사가 길어지고 군집화(clustering)도 심해질 수 있다. **개방 주소법은 충돌을 처리하는 경로를 테이블 내부에 유지하는 대신, 점유율과 삭제 상태가 조회 길이에 직접 영향을 준다.**
