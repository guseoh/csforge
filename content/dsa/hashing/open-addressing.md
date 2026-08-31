---
kind: concept
contentKey: dsa.core.hashing.open-addressing
topicContentKey: dsa.core.hashing
slug: open-addressing
title: "Open Addressing"
summary: "빈 slot을 probe하며 저장하는 방식과 tombstone 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "평균 lookup과 worst-case collision을 비교한다."
    displayOrder: 1
---
# Open Addressing

open addressing은 entry를 table 내부 slot에 직접 두고 collision이 나면 linear·quadratic·double hashing 등의 probe sequence로 다음 후보를 찾는다. lookup은 동일한 probe를 따라가며 빈 slot을 만나기 전까지 key equality를 검사해야 한다.

삭제한 slot을 그냥 empty로 바꾸면 그 뒤에 있던 entry를 찾기 전에 탐색이 멈추므로 tombstone이 필요하다. tombstone이 쌓이면 probe가 길어져 periodic rehash가 필요하고, 높은 load factor는 성능을 급격히 악화시킨다.

### Backend 연결

작은 primitive map을 선택할 때 locality와 deletion workload를 함께 본다. table full, resize 중 예외, process restart 시 volatile state라는 경계를 명시한다.
