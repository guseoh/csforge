---
kind: concept
contentKey: dsa.core.sequential.dynamic-array
topicContentKey: dsa.core.sequential
slug: dynamic-array
title: "Dynamic Array"
summary: "capacity 부족 시 재할당·복사와 amortized append를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "연속 저장과 pointer chaining의 trade-off를 확인한다."
    displayOrder: 1
---
# Dynamic Array

dynamic array는 논리 length와 더 큰 capacity를 가진 backing array를 관리한다. capacity가 가득 차면 `larger allocation → elements copied → old array discarded` 순서가 일어나고, 이후 append는 새 공간에 바로 쓴다.

growth factor가 있으면 resize 횟수는 줄지만 순간 복사와 unused capacity가 늘어난다. 참조가 backing array를 직접 가리키면 resize 뒤 invalid가 될 수 있으므로 public view와 내부 storage의 lifetime을 분리해야 한다.

### Backend 연결

request aggregation이나 import batch의 capacity를 예측해 resize pause를 줄인다. 한 번의 append가 느렸다는 이유로 전체 API가 느리다고 하지 말고 sequence amortized cost와 burst tail을 함께 본다.
