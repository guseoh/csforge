---
kind: concept
contentKey: dsa.core.sequential.array
topicContentKey: dsa.core.sequential
slug: array
title: "Array"
summary: "연속 저장에서 index address를 계산하고 access·shift·locality 비용이 생기는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "array 기반 자료구조와 linked representation의 operation trade-off를 확인한다."
    displayOrder: 1
---
# Array

### Index 접근이 빠른 이유는 원소 위치를 바로 계산할 수 있기 때문이다

Array는 같은 논리 타입의 원소를 일정한 간격으로 연속 배치하는 자료구조 모델이다. 원소 하나가 `elementSize` byte이고 첫 원소의 시작 주소가 `base`라면 index `i`의 위치는 다음처럼 계산할 수 있다.

```text
address(i) = base + i × elementSize
```

앞 원소를 하나씩 따라갈 필요가 없으므로 올바른 index가 주어졌다면 위치 계산 자체는 입력 크기 n과 무관한 O(1)이다.

이 성질은 binary search 같은 알고리즘에서도 중요하다. `mid`를 계산한 뒤 해당 위치를 바로 읽을 수 있기 때문에 탐색 구간을 절반씩 줄일 수 있다. 같은 알고리즘 아이디어를 index 접근이 없는 순차 구조에 그대로 옮기면 비용 모델이 달라질 수 있다.

### 연속 배치는 iteration에도 유리하다

Array를 앞에서 뒤로 순회하면 다음 원소가 가까운 memory에 있다. Hardware cache line과 prefetch가 인접 data를 함께 가져올 수 있어 pointer를 임의의 위치로 따라가는 구조보다 spatial locality가 좋은 경우가 많다.

```text
[a0][a1][a2][a3][a4] ...
 ↑   ↑   ↑   ↑
연속된 주소 범위
```

Big-O가 같더라도 실제 CPU cost가 달라질 수 있는 대표적인 이유다. O(n) array scan과 O(n) linked-list traversal이 반드시 같은 시간에 끝나는 것은 아니다.

### 중간 삽입은 빈 slot 하나를 만드는 문제가 아니다

길이 `n`인 array의 index 2에 새 값을 넣고 기존 순서를 보존하려면 뒤쪽 원소를 한 칸씩 이동해야 한다.

```text
before: [A][B][C][D][E]
insert X at 2
shift :       C→  D→  E→
after : [A][B][X][C][D][E]
```

뒤에 있는 원소 수에 비례해 이동이 필요하므로 일반적인 중간 삽입/삭제는 O(n)이다. 배열의 마지막에 capacity가 충분한 상태로 append하는 경우와는 비용이 다르다.

### Length와 capacity는 같은 개념이 아니다

고정 array는 allocation된 원소 수 자체가 capacity가 될 수 있지만 dynamic array는 실제 사용 중인 `length/size`와 backing storage의 `capacity`를 분리한다. `0 <= index < length`가 일반적인 logical access 범위이고, capacity 안에 빈 공간이 있다고 해서 그 index가 유효한 element라는 뜻은 아니다.

Boundary check를 놓치면 다른 object나 memory를 읽는 low-level bug가 될 수 있다. Java array는 runtime bounds check를 제공하지만 C/C++ native memory나 direct buffer 같은 경계에서는 caller 책임이 커질 수 있다.

### Array가 항상 최선인 것은 아니다

Array는 random access와 iteration에 강하지만 크기 변경, 중간 shift, 큰 연속 allocation 요구가 비용이 될 수 있다. 또 object reference array라면 array 자체는 연속이어도 실제 object body가 모두 인접하다는 보장은 없다.

자료구조를 선택할 때는 'array는 O(1) 접근' 한 줄보다 실제 operation sequence를 본다. 대부분 순회/조회인지, 중간 삽입이 많은지, size가 예측 가능한지, primitive/compact data인지와 cache locality가 중요한지를 함께 판단한다.
