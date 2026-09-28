---
kind: concept
contentKey: dsa.core.hashing.bucket-mapping
topicContentKey: dsa.core.hashing
slug: bucket-mapping
title: "버킷 매핑(Bucket Mapping)"
summary: "해시 값을 현재 테이블 용량 범위의 버킷 인덱스로 변환하고 크기 조정이 매핑을 바꾸는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "해시 함수, 분리 연결법·선형 탐사, 부하율과 검색 비용을 확인한다."
    displayOrder: 1
---
# 버킷 매핑(Bucket Mapping)

해시 함수가 만든 값의 범위는 실제 해시 테이블의 버킷 수보다 훨씬 클 수 있다. 그래서 테이블은 해시 값을 현재 용량 범위 `[0, capacity)`의 버킷 또는 첫 후보 슬롯 인덱스로 다시 매핑한다.

간단한 모델은 다음과 같다.

```text
h = hash(key)
index = normalize(h mod capacity)
```

언어의 나머지 연산 규칙에 따라 음수 결과가 나올 수 있으므로 최종 인덱스가 항상 유효한 범위가 되도록 정규화해야 한다. 용량이 2의 거듭제곱인 구현에서는 비트 마스크를 사용할 수도 있지만, 이 경우에도 해시 비트가 충분히 고르게 섞여 있다는 전제가 중요하다.

버킷 인덱스는 키의 영구적인 속성이 아니다. 같은 해시 값이라도 용량이 바뀌면 다른 인덱스로 매핑될 수 있다.

```text
용량 8  → h mod 8
용량 16 → h mod 16
```

그래서 해시 테이블 크기를 조정할 때는 기존 항목을 새 용량 기준으로 다시 배치해야 한다. **버킷 매핑은 키의 해시 값과 현재 테이블 구조를 연결하는 단계이며, 충돌을 처리하기 전에 첫 후보 위치를 정하는 역할**을 한다.
