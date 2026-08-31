---
kind: concept
contentKey: dsa.core.hashing.resize
topicContentKey: dsa.core.hashing
slug: resize
title: "Hash Table Resize"
summary: "capacity 변경 후 모든 key의 bucket을 재계산하는 비용을 분석한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "평균 lookup과 worst-case collision을 비교한다."
    displayOrder: 1
---
# Hash Table Resize

capacity를 바꾸면 modulo나 mask가 달라져 기존 entry의 bucket index를 다시 계산해야 한다. 새 table을 만들고 모든 key를 reinsert한 뒤 참조를 교체하는 동안 access를 잠그거나 version을 관리해야 하며, 복사 중 실패하면 기존 table을 보존해야 한다.

배수를 늘리면 resize 빈도가 줄고 전체 sequence amortized cost가 낮아지지만 memory peak가 두 table 크기의 합에 가까워질 수 있다. lazy migration은 peak를 줄일 수 있지만 lookup이 old/new table을 모두 확인하는 복잡도가 생긴다.

### Backend 연결

runtime cache의 cold-start와 resize pause를 p99에 포함한다. 재시작 가능한 canonical data와 process-local hash table을 혼동하지 않는다.
