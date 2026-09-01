---
kind: concept
contentKey: dsa.core.sequential.doubly-linked-list
topicContentKey: dsa.core.sequential
slug: doubly-linked-list
title: "Doubly Linked List"
summary: "prev·next 양방향 link invariant와 O(1) unlink의 전제·memory trade-off를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "linked representation에서 node link를 갱신하는 기본 구조를 확인한다."
    displayOrder: 1
---
# Doubly Linked List

### 이전 node를 다시 찾지 않고 양방향으로 이동하고 싶다

Doubly linked list는 각 node가 `next`뿐 아니라 `prev`도 저장한다.

```text
null ← [A] ⇄ [B] ⇄ [C] ⇄ [D] → null
        ↑                 ↑
       head              tail
```

현재 node를 알고 있다면 다음 node와 이전 node로 모두 O(1)에 이동할 수 있다. 그래서 중간 node reference를 이미 가지고 있을 때 해당 node를 list에서 제거하기도 singly linked list보다 단순하다.

### 삭제는 두 이웃의 관계를 다시 연결하는 작업이다

B와 D 사이에 있는 C를 삭제한다고 하자.

```text
before: B ⇄ C ⇄ D

B.next = D
D.prev = B

after : B ⇄ D
```

현재 C를 알고 있다면 `C.prev`와 `C.next`를 바로 얻을 수 있으므로 predecessor를 찾기 위한 head traversal이 필요 없다. 이 의미에서 node reference가 이미 주어졌을 때 unlink는 O(1)이다.

하지만 C를 index나 value로 찾아야 한다면 검색 O(n)은 여전히 필요하다. Singly linked list와 마찬가지로 '삭제 O(1)'에는 **삭제할 node를 이미 알고 있다**는 전제가 붙는다.

### 양방향 link는 더 강한 invariant를 요구한다

정상 list의 인접 node B, C에 대해 다음 관계가 함께 성립해야 한다.

```text
B.next == C
C.prev == B
```

한 방향만 갱신하면 forward traversal과 reverse traversal이 서로 다른 구조를 보게 된다.

```text
B.next = D     // 변경
D.prev = C     // 이전 값이 남음
```

이 상태에서는 head에서 앞으로 가면 C가 삭제된 것처럼 보이지만 D에서 뒤로 가면 여전히 C에 도달할 수 있다. 이후 삭제나 이동 operation이 stale link를 사용해 list를 더 손상시킬 수 있다.

따라서 insert/delete는 하나의 pointer assignment가 아니라 **operation이 끝났을 때 양방향 관계 전체를 복원하는 state transition**으로 이해해야 한다.

### Sentinel node는 경계 case를 구조 안으로 흡수한다

Head와 tail에서 삽입/삭제할 때는 `prev == null`, `next == null` 같은 특수 분기가 필요하다. Dummy/sentinel node를 양끝에 두면 실제 data node는 대부분 같은 link update 규칙으로 처리할 수 있다.

```text
HEAD ⇄ [A] ⇄ [B] ⇄ TAIL
```

Sentinel 자체는 사용자 data가 아니므로 size에 포함할지, iteration에서 노출하지 않을지를 implementation contract로 명확히 해야 한다.

### 추가 pointer는 편리함의 대가다

각 node마다 prev reference가 하나 더 필요하고, insert/delete에서 더 많은 pointer write를 수행한다. Object allocation과 pointer chasing에 따른 cache locality 문제도 singly linked list와 마찬가지로 남는다.

Doubly linked list가 빛나는 대표적인 상황은 **중간 node를 O(1)에 제거하면서 순서도 유지해야 할 때**다. 예를 들어 hash map으로 key→node를 찾고 doubly linked list로 사용 순서를 관리하는 LRU structure에서는 lookup은 map이, O(1) node 이동/삭제는 list가 담당한다.

이때도 map과 list는 별도 invariant를 가진다. Map이 가리키는 node와 list에 실제 존재하는 node가 항상 일치해야 하므로 두 구조의 update 순서와 실패 처리까지 함께 설계해야 한다.
