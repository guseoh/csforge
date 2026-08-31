---
kind: concept
contentKey: dsa.core.complexity.invariant-correctness
topicContentKey: dsa.core.complexity
slug: invariant-correctness
title: "Invariant and Correctness"
summary: "loop invariant가 초기·유지·종료 조건으로 정답을 보이는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Invariant and Correctness

invariant는 loop나 자료구조 operation이 진행되는 동안 계속 참이어야 하는 주장이다. 초기 상태에서 참이고, 한 번의 반복이 이를 보존하며, 종료 조건에서 invariant가 원하는 답을 함의하면 알고리즘의 correctness를 설명할 수 있다.

예를 들어 binary search에서 구간 밖에는 target이 없다는 invariant를 유지하면 mid 비교 뒤 버려도 되는 구간이 명확해진다. 코드가 “대부분” 맞는지보다 빈 배열·중복·경계 index에서도 invariant가 유지되는지를 확인해야 한다.

### Backend 연결

pagination cursor, dedup set, import upsert 같은 코드를 리뷰할 때 재실행 전후 invariant를 문장으로 적는다. 테스트는 정상 입력뿐 아니라 invariant를 깨뜨리는 순서와 빈 상태를 포함해야 한다.
