---
kind: concept
contentKey: dsa.core.sequential.array
topicContentKey: dsa.core.sequential
slug: array
title: "Array"
summary: "연속 저장과 index 계산이 constant-time 접근을 만드는 이유와 중간 삽입·locality 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stack의 LIFO operation과 array/linked implementation trade-off를 확인한다."
    displayOrder: 1
---
# Array

Array는 원소를 일정한 간격으로 연속된 저장 공간에 배치하는 자료구조다. 첫 원소의 위치와 원소 하나의 크기를 알고 있다면 index `i`의 위치를 직접 계산할 수 있다.

```text
address(i) = base + i × elementSize
```

앞 원소를 순서대로 따라갈 필요가 없으므로 유효한 index가 주어졌을 때 접근 비용은 `O(1)`이다. 이 random access 성질은 binary search처럼 중간 위치를 반복해서 읽는 알고리즘에도 중요하다.

연속 저장은 순차 접근에도 장점이 있다. 인접한 원소가 가까운 memory에 있으므로 cache line과 prefetch가 효과적으로 동작할 가능성이 높다. 따라서 두 구조가 모두 `O(n)` 순회라고 해도 실제 실행 비용은 memory layout에 따라 달라질 수 있다.

반면 중간에 원소를 삽입하거나 삭제하면서 순서를 유지하려면 뒤쪽 원소를 이동해야 한다.

```text
[A][B][C][D]
insert X at 2
[A][B][X][C][D]
        ← C,D 이동 필요
```

이동해야 하는 원소 수가 입력 크기에 비례할 수 있으므로 일반적인 중간 삽입·삭제는 `O(n)`이다. **Array의 핵심 trade-off는 빠른 index 접근과 좋은 locality를 얻는 대신, 크기 변경과 중간 이동 비용을 감수하는 것**이다.
