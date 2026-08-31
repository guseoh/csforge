---
kind: concept
contentKey: dsa.core.sequential.array
topicContentKey: dsa.core.sequential
slug: array
title: "Array"
summary: "연속 저장과 index 계산이 constant-time 접근을 만드는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "연속 저장과 pointer chaining의 trade-off를 확인한다."
    displayOrder: 1
---
# Array

array는 같은 크기의 원소를 연속 memory에 두어 `base + index × elementSize`로 위치를 계산한다. index 접근은 일정한 횟수의 주소 계산으로 가능하지만 중간 삽입은 뒤 원소를 이동해야 하고 capacity가 고정되어 있다.

연속 배치는 cache locality와 단순한 iteration에 유리하다. 반면 원소 크기가 크거나 insert/delete가 잦으면 복사 비용과 빈 공간이 문제가 되며, logical length와 allocated capacity를 혼동하면 범위 오류가 난다.

### Backend 연결

batch 결과와 primitive column을 저장할 때 array가 object graph보다 locality를 줄 수 있다. 외부 입력의 count를 바로 index로 쓰지 말고 bounds와 overflow를 먼저 검증한다.
