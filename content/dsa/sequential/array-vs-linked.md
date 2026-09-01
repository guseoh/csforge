---
kind: concept
contentKey: dsa.core.sequential.array-vs-linked
topicContentKey: dsa.core.sequential
slug: array-vs-linked
title: "Array versus Linked"
summary: "random access·삽입 위치 탐색·locality·allocation·reference 안정성으로 연속/linked 구조를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stack의 LIFO operation과 array/linked implementation trade-off를 확인한다."
    displayOrder: 1
---
# Array versus Linked

### Big-O 한 칸만 비교하면 실제 선택 조건을 놓친다

Array와 linked structure를 비교할 때 흔히 다음 표부터 외운다.

| Operation | Array | Linked list |
| --- | --- | --- |
| index access | O(1) | O(n) |
| sequential scan | O(n) | O(n) |
| known-node link insert/delete | O(n) shift 가능 | O(1) link update 가능 |

이 표는 출발점일 뿐이다. 특히 linked list의 O(1) insert/delete에는 **operation 위치의 node 또는 predecessor를 이미 알고 있다**는 전제가 있다. `10번째 위치에 삽입`하려면 먼저 10번째 node까지 O(n) 순회해야 한다.

### 조회가 중심이면 연속 저장이 강하다

Array는 index 위치를 계산할 수 있고 원소가 연속적으로 배치되므로 random access와 sequential traversal에 유리하다. 같은 O(n) scan이라도 array는 다음 data가 가까운 address에 있어 CPU cache line과 prefetch를 활용하기 쉽다.

Linked list는 다음 node address를 현재 node에서 읽은 뒤에야 다음 memory access를 시작할 수 있다. Node가 heap 여러 위치에 흩어져 있으면 pointer chasing과 cache miss가 반복될 수 있다.

```text
array : [A][B][C][D]       → 주소가 연속
list  : [A] → [B] → [C]    → node 위치는 흩어질 수 있음
```

그래서 '둘 다 traversal O(n)'이라는 점만으로 실제 성능이 같다고 결론내리지 않는다.

### 변경이 많아도 linked가 자동으로 이기는 것은 아니다

Middle insert/delete에서 array는 순서를 유지하기 위해 여러 원소를 shift해야 한다. 반면 linked list는 정확한 node 위치를 이미 확보했다면 몇 개의 link만 바꿀 수 있다.

하지만 workload가 `key로 node를 찾은 뒤 삭제`라면 linked list 단독으로는 key search O(n)이 필요하다. LRU cache처럼 hash map을 함께 사용해 key→node lookup을 O(1) expected로 만들 때 비로소 linked list의 O(1) unlink 장점이 살아난다.

자료구조 조합이 필요한 이유를 operation sequence 전체로 봐야 한다.

### Memory footprint와 allocation behavior도 다르다

Array는 capacity만큼 연속 storage를 확보하고 원소 사이에 per-node pointer가 없다. Dynamic array는 unused capacity가 생길 수 있지만 많은 작은 object allocation을 피할 수 있다.

Linked list는 각 node마다 next/prev reference와 object/allocator metadata가 필요할 수 있다. 원소 수가 많으면 이 overhead가 data 자체보다 커질 수도 있다. GC language에서는 많은 node object가 allocation/GC pressure를 만들 수 있다.

반대로 매우 큰 contiguous block을 확보하기 어렵거나 node의 address/identity가 operation 동안 안정적으로 유지되어야 하는 low-level 구조에서는 linked representation이 유리한 상황도 있다.

### 선택은 '어떤 operation이 몇 번 일어나는가'로 한다

예를 들어 다음 세 workload는 답이 다를 수 있다.

#### 읽기 중심 result buffer

```text
append 많음
sequential scan 많음
중간 삭제 거의 없음
```

Dynamic array가 잘 맞는 경우가 많다.

#### LRU order 관리

```text
key lookup
찾은 node를 중간에서 제거
맨 앞으로 이동
```

Hash map + doubly linked list 조합이 자연스럽다.

#### Graph adjacency

각 vertex의 neighbor를 순회하는 것이 주 작업이라면 compact adjacency array/vector가 locality에서 유리할 수 있고, mutation pattern에 따라 linked representation과 trade-off가 달라진다.

Backend에서 Java `ArrayList`와 `LinkedList` 이름만 비교하지 않는다. 실제 size distribution, lookup/scan/insert/delete 비율, memory footprint, allocation과 cache behavior를 측정하고 필요한 operation에 맞는 abstraction을 선택한다.
