---
kind: concept
contentKey: dsa.core.sequential.dynamic-array
topicContentKey: dsa.core.sequential
slug: dynamic-array
title: "동적 배열(Dynamic Array)"
summary: "size와 용량을 분리하고 용량 부족 시 재할당·복사와 분할 상환 append를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "스택·큐의 LIFO/FIFO 계약과 배열, 크기 조정 배열, linked-list 구현을 비교한다."
    displayOrder: 1
---
# 동적 배열(Dynamic Array)

동적 배열은 배열의 인덱스 접근 성질을 유지하면서 원소 수가 증가할 때 내부 저장 공간을 더 큰 배열로 교체할 수 있게 만든 구조다. 현재 저장된 원소 수인 `size`와 확보한 슬롯 수인 `capacity`를 분리해서 관리한다.

```text
size = 3, capacity = 6
[A][B][C][ ][ ][ ]
```

`size < capacity`라면 끝에 원소를 추가하는 append는 다음 빈 슬롯에 값을 쓰고 size를 증가시키면 되므로 `O(1)`이다. 하지만 용량이 가득 차면 더 큰 배열을 확보하고 기존 원소를 복사해야 한다.

```text
[A][B][C][D]          capacity 4
      ↓ resize + copy
[A][B][C][D][ ][ ][ ][ ]   capacity 8
```

크기 조정이 발생한 한 번의 append는 기존 `n`개 원소를 복사하므로 `O(n)`일 수 있다. 그러나 용량을 두 배처럼 비율로 늘리면 크기 조정이 점점 드물어져 긴 연속 추가 연산의 분할 상환 cost는 `O(1)`이 된다.

증가 배수가 작으면 남는 용량은 줄지만 크기 조정이 자주 일어나고, 크게 잡으면 크기 조정 횟수는 줄지만 빈 공간과 크기 조정 순간의 메모리 peak가 커진다. 또한 끝 append와 달리 중간 인덱스 삽입은 뒤 원소를 shift해야 하므로 일반적으로 `O(n)`이다.

**동적 배열의 핵심은 O(1) 임의 접근을 유지하면서 용량을 단계적으로 늘리고, 드문 크기 조정 비용을 여러 append에 나누는 것**이다.
