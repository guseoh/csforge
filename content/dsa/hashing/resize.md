---
kind: concept
contentKey: dsa.core.hashing.resize
topicContentKey: dsa.core.hashing
slug: resize
title: "해시 테이블 크기 조정(Resize)"
summary: "용량 변경이 버킷 매핑을 바꾸기 때문에 저장된 항목을 새 테이블에 다시 배치해야 하는 이유와 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "해시 함수, 분리 연결법·선형 탐사, 부하율과 검색 비용을 확인한다."
    displayOrder: 1
---
# 해시 테이블 크기 조정(Resize)

해시 테이블의 버킷이나 슬롯 위치는 보통 해시 값과 현재 용량을 함께 사용해 계산한다. 따라서 용량이 바뀌면 같은 키도 다른 위치로 매핑될 수 있다.

```text
기존 용량 8  → index = map(h, 8)
새 용량 16   → index = map(h, 16)
```

그래서 크기 조정은 내부 배열을 단순히 더 큰 공간에 복사하는 작업이 아니다. 새 테이블을 만든 뒤 현재 저장된 각 항목을 새 용량 기준으로 다시 버킷 또는 탐사 순서에 배치해야 한다.

```text
새 테이블 할당
      ↓
저장된 각 항목에 대해
  새 위치 계산
  새 테이블에 삽입
      ↓
기존 테이블 교체
```

저장된 항목이 `n`개라면 한 번의 즉시 크기 조정은 `O(n)` 비용이 들 수 있다. 하지만 용량을 일정 비율로 늘려 크기 조정 빈도를 충분히 낮추면 연속된 삽입 전체에서는 그 비용을 분할 상환해 분석할 수 있다.

크기 조정 중에는 기존 테이블과 새 테이블이 동시에 필요해 순간 메모리 사용량도 증가할 수 있다. **크기 조정은 부하율을 낮춰 이후 연산 비용을 줄이는 대신, 가끔 저장된 항목 전체를 재배치하는 큰 비용을 지불하는 과정이다.**
