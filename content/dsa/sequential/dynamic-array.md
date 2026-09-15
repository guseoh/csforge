---
kind: concept
contentKey: dsa.core.sequential.dynamic-array
topicContentKey: dsa.core.sequential
slug: dynamic-array
title: "Dynamic Array"
summary: "size와 capacity를 분리하고 capacity 부족 시 재할당·복사와 amortized append를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stack의 LIFO operation과 array/linked implementation trade-off를 확인한다."
    displayOrder: 1
---
# Dynamic Array

Dynamic array는 array의 index 접근 성질을 유지하면서 원소 수가 증가할 때 backing storage를 더 큰 배열로 교체할 수 있게 만든 구조다. 현재 저장된 원소 수인 `size`와 확보한 slot 수인 `capacity`를 분리해서 관리한다.

```text
size = 3, capacity = 6
[A][B][C][ ][ ][ ]
```

`size < capacity`라면 끝에 원소를 추가하는 append는 다음 빈 slot에 값을 쓰고 size를 증가시키면 되므로 `O(1)`이다. 하지만 capacity가 가득 차면 더 큰 배열을 확보하고 기존 원소를 복사해야 한다.

```text
[A][B][C][D]          capacity 4
      ↓ resize + copy
[A][B][C][D][ ][ ][ ][ ]   capacity 8
```

Resize가 발생한 한 번의 append는 기존 `n`개 원소를 복사하므로 `O(n)`일 수 있다. 그러나 capacity를 두 배처럼 비율로 늘리면 resize가 점점 드물어져 긴 append sequence의 amortized cost는 `O(1)`이 된다.

Growth factor가 작으면 unused capacity는 줄지만 resize가 자주 일어나고, 크게 잡으면 resize 횟수는 줄지만 빈 공간과 resize 순간의 memory peak가 커진다. 또한 끝 append와 달리 중간 index 삽입은 뒤 원소를 shift해야 하므로 일반적으로 `O(n)`이다.

**Dynamic array의 핵심은 O(1) random access를 유지하면서 capacity를 단계적으로 늘리고, 드문 resize 비용을 여러 append에 나누는 것**이다.
