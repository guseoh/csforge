---
kind: concept
contentKey: java.core.collections.arraylist-linkedlist-tradeoff
topicContentKey: java.core.collections
slug: arraylist-linkedlist-tradeoff
title: "ArrayList와 LinkedList의 실제 선택 기준"
summary: "접근·순회·삽입·삭제 비용뿐 아니라 탐색 비용, 객체 할당과 지역성까지 고려해 두 List 구현을 비교한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html"
    title: "Java SE 25 API: ArrayList"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: resizable-array List 구현과 연산 특성 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedList.html"
    title: "Java SE 25 API: LinkedList"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: doubly-linked List/Deque 구현 계약 확인
---
# ArrayList와 LinkedList의 실제 선택 기준

두 구현을 비교할 때 흔히 “ArrayList는 조회가 빠르고 LinkedList는 삽입·삭제가 빠르다”라고 외웁니다. 하지만 실제 코드는 **삽입 위치까지 어떻게 찾아가는지, 얼마나 자주 순회하는지, 원소 외에 어떤 객체가 필요한지**까지 봐야 합니다.

### ArrayList는 index 접근이 단순하다

`ArrayList`는 JDK API가 설명하듯 크기가 늘어나는 배열 기반 List 구현입니다. index를 이용해 특정 위치에 접근하기 쉽습니다.

```java
list.get(500);
```

중간에 원소를 삽입하거나 삭제하면 뒤 원소들을 이동해야 할 수 있습니다.

```text
[A][B][C][D]
      ↑ X 삽입
[A][B][X][C][D]
          └── 뒤 원소 이동
```

내부 배열이 실제 하드웨어 메모리에서 어떤 물리 주소에 배치되는지는 Java API 계약이 아닙니다. 다만 배열 기반 참조 저장 구조는 node 객체를 하나씩 따라가는 구조와 다른 접근 특성을 가집니다.

### LinkedList는 node 연결을 바꾼다

`LinkedList`는 이중 연결 리스트 구현입니다. 이미 특정 node 위치를 알고 있다면 주변 연결을 바꾸어 삽입·삭제할 수 있습니다.

```text
A <-> B <-> C
      ↓
A <-> X <-> B <-> C
```

하지만 `list.get(500)`처럼 index로 위치를 찾으려면 앞이나 뒤에서 node를 따라 이동해야 합니다. “중간 삽입 O(1)”이라는 문장만 보고 실제 `add(index, value)` 전체 비용까지 O(1)이라고 생각하면 안 됩니다. **위치 탐색 비용이 포함될 수 있기 때문**입니다.

### 순회와 메모리 비용도 다르다

LinkedList는 원소마다 이전/다음 node 연결 정보를 위한 객체 구조가 필요합니다. 많은 작은 node 객체와 참조를 따라가는 방식은 ArrayList와 다른 allocation·cache locality 특성을 가질 수 있습니다.

이 때문에 일반적인 목록 저장과 순회에서는 ArrayList가 좋은 기본 선택인 경우가 많습니다. 하지만 이것을 모든 workload에 대한 성능 보장으로 외우지 말고 실제 데이터 크기와 연산 패턴을 봐야 합니다.

### Queue/Deque가 목적이면 인터페이스부터 다시 본다

앞뒤에서 원소를 넣고 빼는 queue/deque 동작이 필요하다면 `List` 비교보다 `Deque` 계약을 먼저 보는 것이 좋습니다. 이런 용도에서는 `ArrayDeque`가 더 자연스러운 기본 선택일 수 있습니다.

### 선택 문제를 푸는 순서

1. random access가 필요한가?
2. 대부분 순회인가?
3. 삽입·삭제 위치를 찾는 비용은 얼마인가?
4. node 객체 추가 비용이 의미 있는 규모인가?
5. 실제 요구는 List가 아니라 Queue/Deque인가?

Big-O 한 줄을 외우는 것보다 **전체 연산 경로를 계산하는 습관**이 중요합니다.
