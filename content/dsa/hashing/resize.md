---
kind: concept
contentKey: dsa.core.hashing.resize
topicContentKey: dsa.core.hashing
slug: resize
title: "해시 테이블 크기 조정(Resize)"
summary: "용량 변경이 버킷 mapping을 바꾸기 때문에 live entry를 새 테이블에 다시 배치해야 하는 이유와 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "해시 함수, separate chaining·linear probing, 부하율과 검색 비용을 확인한다."
    displayOrder: 1
---
# 해시 테이블 크기 조정(Resize)

해시 테이블의 버킷이나 슬롯 위치는 보통 해시 값과 현재 용량을 함께 사용해 계산한다. 따라서 용량이 바뀌면 같은 key도 다른 위치로 매핑될 수 있다.

```text
old capacity = 8  → index = map(h, 8)
new capacity = 16 → index = map(h, 16)
```

그래서 크기 조정은 backing 배열을 단순히 더 큰 공간에 복사하는 작업이 아니다. 새 테이블을 만든 뒤 각 live entry를 새 용량 기준으로 다시 버킷 또는 probe sequence에 배치해야 한다.

```text
allocate new table
      ↓
for each live entry
  recompute location
  insert into new table
      ↓
replace old table
```

Entry가 `n`개라면 한 번의 eager 크기 조정은 `O(n)` 비용이 들 수 있다. 하지만 용량을 일정 비율로 늘려 크기 조정 빈도를 충분히 낮추면 insert sequence 전체에서는 분할 상환 비용으로 분산할 수 있다.

크기 조정 중에는 old 테이블과 new 테이블이 동시에 필요해 순간 메모리 사용도 증가할 수 있다. **크기 조정의 핵심은 부하율을 낮춰 이후 연산 비용을 줄이는 대신, 가끔 모든 entry를 재배치하는 큰 비용을 지불하는 것**이다.
