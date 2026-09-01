---
kind: concept
contentKey: dsa.core.trees.priority-queue
topicContentKey: dsa.core.trees
slug: priority-queue
title: "Priority Queue"
summary: "FIFO와 다른 priority ordering contract, heap 구현 비용, tie-breaking과 priority update 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/24pq/"
    title: "Algorithms, 4th Edition: Priority Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "priority queue ADT와 binary heap 구현의 비용을 확인한다."
    displayOrder: 1
---
# Priority Queue

### 먼저 들어온 원소가 아니라 가장 중요한 원소를 꺼낸다

일반 queue는 FIFO를 핵심 invariant로 가진다. 반면 priority queue는 삽입 순서와 무관하게 현재 원소 중 가장 높은 또는 가장 낮은 priority를 가진 원소를 다음 대상으로 선택한다.

```text
insert(A, priority=5)
insert(B, priority=1)
insert(C, priority=3)

min-priority queue → B가 먼저 나옴
```

따라서 단순 queue를 priority queue로 바꾸는 것은 구현 최적화가 아니라 **업무 ordering contract 자체를 바꾸는 선택**이다.

### heap은 priority queue를 효율적으로 구현하는 대표 방법이다

binary heap을 사용하면 root에 최우선 원소를 유지할 수 있어 peek는 O(1), insert와 extract-min/max는 O(log n)으로 구현할 수 있다. 하지만 priority queue라는 추상화가 반드시 heap을 의미하는 것은 아니다. ordered tree, unsorted array 등 다른 구현도 가능하고 operation mix에 따라 trade-off가 다르다.

### 같은 priority의 순서는 별도 계약이다

두 task의 priority가 같다면 누가 먼저 나오는지는 priority 값 하나로 결정되지 않는다. FIFO tie-breaker가 필요하다면 `(priority, sequence)`처럼 secondary ordering을 명시해야 한다.

이 규칙이 없으면 동일 priority task의 순서가 heap 내부 swap에 따라 달라질 수 있다. 테스트에서 우연히 같은 순서가 나왔다고 stable ordering을 보장한다고 문서화하면 안 된다.

### 이미 들어간 원소의 priority가 바뀌면 heap invariant도 다시 맞춰야 한다

heap 안의 원소 priority를 직접 수정하면 현재 위치가 더 이상 올바르지 않을 수 있다. decrease-key/increase-key 같은 operation으로 sift-up/down을 수행하거나, old entry를 invalid 처리하고 새 값으로 reinsert하는 방법이 필요하다.

임의 원소의 위치를 O(1)에 찾고 싶다면 item→heap-index 같은 보조 index를 유지해야 할 수도 있다. 이 index도 swap 때마다 함께 갱신해야 한다.

### scheduling에서는 starvation까지 생각한다

높은 priority task가 계속 들어오면 낮은 priority task는 무기한 뒤로 밀릴 수 있다. 자료구조가 priority order를 정확하게 지켜도 application policy로서는 잘못될 수 있다.

따라서 실제 retry/scheduler에서는 aging, deadline, quota 같은 정책을 추가할 수 있다. 이때 priority queue는 **현재 우선순위를 효율적으로 뽑는 자료구조**이고, starvation을 막는 것은 상위 scheduling policy의 책임이라는 경계를 구분해야 한다.
