---
kind: concept
contentKey: dsa.core.hashing.collision
topicContentKey: dsa.core.hashing
slug: collision
title: "Collision"
summary: "서로 다른 key가 같은 bucket을 선택하는 필연성과 처리 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "평균 lookup과 worst-case collision을 비교한다."
    displayOrder: 1
---
# Collision

가능한 key 수보다 bucket 수가 적으므로 서로 다른 key가 같은 bucket에 오는 collision은 피할 수 없다. table은 bucket list를 순회하거나 빈 slot을 probe해 실제 key equality를 확인함으로써 collision 속에서도 정답을 찾는다.

hash가 같다는 것이 key가 같다는 뜻은 아니다. equality 검사를 생략하면 잘못된 값을 반환하고, collision이 길어지면 평균 O(1) 기대가 O(n)에 가까워질 수 있다.

### Backend 연결

cache 조회가 hit인데 값이 틀린 문제를 hash collision과 equality bug로 분리한다. public key를 hash만으로 비교하는 protocol은 collision-resistant identifier 계약을 별도로 가져야 한다.
