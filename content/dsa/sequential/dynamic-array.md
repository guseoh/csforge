---
kind: concept
contentKey: dsa.core.sequential.dynamic-array
topicContentKey: dsa.core.sequential
slug: dynamic-array
title: "Dynamic Array"
summary: "size와 capacity를 분리하고 growth·copy·amortized append·memory peak를 연결해 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "resizing-array representation과 amortized operation cost를 확인한다."
    displayOrder: 1
---
# Dynamic Array

### 고정 array의 random access를 유지하면서 크기를 늘리고 싶다

고정 array는 index 접근이 빠르지만 처음 정한 capacity를 넘겨 원소를 추가할 수 없다. Dynamic array는 내부에 더 큰 backing array를 두고, 현재 사용 중인 원소 수 `size`와 실제 확보한 slot 수 `capacity`를 따로 관리해 이 문제를 해결한다.

```text
size = 3, capacity = 8

[A][B][C][ ][ ][ ][ ][ ]
 ↑ 사용 중 ↑      남은 capacity
```

`size < capacity`인 동안 append는 `backing[size]`에 값을 쓰고 size를 하나 늘리면 된다. 이 경우 operation은 O(1)이다.

### Capacity가 가득 차면 backing storage 자체를 교체한다

`size == capacity`에서 append하려면 기존 array 뒤에 물리적으로 공간을 붙인다고 가정할 수 없다. 일반적인 dynamic array는 더 큰 새 array를 확보하고 기존 원소를 복사한 뒤 새 원소를 추가한다.

```text
old: [A][B][C][D]        capacity 4
           │ copy
           ▼
new: [A][B][C][D][E][ ][ ][ ]  capacity 8
```

이 resize operation은 기존 `n`개 원소를 옮기므로 O(n)일 수 있다. 하지만 capacity를 2배처럼 multiplicative하게 늘리면 resize는 점점 드물어지고, 앞의 Amortized Analysis에서 본 것처럼 긴 append sequence 전체에서는 amortized O(1)을 얻을 수 있다.

### Growth factor는 resize 횟수와 memory 낭비를 동시에 바꾼다

Capacity를 조금씩 늘리면 unused memory는 적지만 resize/copy가 자주 발생한다. 반대로 큰 비율로 늘리면 copy 빈도는 줄지만 아직 쓰지 않는 capacity가 많아진다.

Resize 순간에는 old array와 new array가 동시에 존재할 수 있어 temporary memory peak도 커질 수 있다. 원소가 큰 value이거나 object reference가 매우 많으면 copy bandwidth와 GC pressure도 고려해야 한다.

### 외부에서 backing array의 위치에 의존하면 resize가 문제가 된다

Dynamic array abstraction은 logical element sequence를 보존하지만 backing storage의 physical identity를 보존하는 것은 아니다. Resize 뒤에는 새로운 backing array로 교체될 수 있다.

High-level collection에서는 내부 array reference를 사용자에게 직접 노출하지 않는 이유다. Low-level native buffer처럼 외부 component가 raw pointer를 오래 보관한다면 reallocation이 pointer invalidation 문제로 이어질 수 있다.

### Append와 중간 insert의 비용을 구분한다

Dynamic array라고 해서 모든 삽입이 amortized O(1)은 아니다. 끝에 append할 때는 빈 capacity를 바로 사용할 수 있지만, 중간 index에 순서를 보존하며 insert하려면 뒤 원소를 shift해야 한다.

따라서 다음 두 operation을 구분한다.

```text
append at end with spare capacity → O(1)
insert at arbitrary middle         → O(n) shift
```

Resize가 발생하는 append는 개별 worst case O(n)이지만 amortized O(1)이고, 중간 insert는 resize 여부와 별개로 shift 때문에 O(n)이다.

Backend에서 import batch나 aggregation buffer를 설계할 때 예상 size를 알면 초기 capacity 예약으로 resize pause를 줄일 수 있다. 하지만 최대 예상치만큼 무조건 preallocate하면 동시 request가 많을 때 heap peak가 커지므로 size distribution과 p99 memory/latency를 함께 본다.
