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

두 구현을 비교할 때 흔히 "ArrayList는 조회가 빠르고 LinkedList는 삽입·삭제가 빠르다"라고 외웁니다. 하지만 실제 비용은 **삽입 위치까지 어떻게 찾아가는지, 순회가 얼마나 많은지, 구조를 유지하기 위해 어떤 추가 객체와 참조가 필요한지**까지 봐야 합니다.

```csforge-viz
{
  "version": 1,
  "type": "java-api-contract",
  "example": "list-layout",
  "title": "접근과 삽입 비용의 분해",
  "description": "배열의 참조 슬롯 이동과 연결 리스트의 위치 탐색을 구별합니다. 물리 객체 배치 그림은 아닙니다."
}
```

### ArrayList는 배열 기반의 인덱스 접근에 강하다

`ArrayList`는 크기가 늘어나는 배열 기반 List입니다. 인덱스로 특정 위치를 찾을 때는 앞 원소를 하나씩 따라갈 필요가 없습니다.

```java
list.get(500);
```

반면 중간에 원소를 넣거나 빼면 뒤쪽 원소 참조를 이동해야 할 수 있습니다.

`[A, B, C, D]`의 index 2에 X를 넣으면 `[A, B, X, C, D]`가 되어 C와 D의 참조를 뒤로 이동합니다.

여기서 "배열 기반"이라는 설명을 각 원소 객체가 물리 메모리에 연속 배치된다는 보장으로 확대하면 안 됩니다. ArrayList의 기반 array에 **원소 참조가 배열 형태로 저장된다**는 것과 객체 자체의 물리 배치는 다른 계층의 이야기입니다.

### LinkedList는 연결 변경보다 위치 탐색 비용을 함께 봐야 한다

`LinkedList`는 이중 연결 리스트입니다. 이미 특정 노드를 알고 있다면 주변 연결을 바꾸는 삽입·삭제 자체는 작게 끝날 수 있습니다.

B 앞에 X를 삽입하려면 A·B 사이의 연결을 A·X·B로 바꿉니다.

하지만 `add(500, value)`처럼 인덱스로 위치를 지정하면 먼저 해당 위치까지 노드를 따라가야 합니다. 따라서 "LinkedList의 중간 삽입은 O(1)"이라는 문장을 `add(index, value)` 전체 비용으로 그대로 옮기면 안 됩니다.

전체 삽입 비용은 위치 탐색 비용과 연결 변경 비용을 합쳐 판단합니다.

### 순회와 메모리 구조도 선택에 영향을 준다

LinkedList는 원소마다 이전·다음 노드 연결을 관리하는 구조가 필요합니다. ArrayList는 별도 노드 객체 없이 기반 array에 원소 참조를 보관합니다. 이런 차이는 할당량과 실제 순회 성능에도 영향을 줄 수 있습니다.

그래서 일반적인 목록 저장·순회·인덱스 접근에서는 ArrayList가 좋은 기본 선택인 경우가 많습니다. 다만 이것은 모든 작업 부하에 대한 절대 규칙이 아니라 실제 연산 패턴을 보고 판단할 출발점입니다.

### Queue나 Deque가 목적이면 List 구현 비교부터 시작하지 않는다

앞뒤에서 원소를 넣고 빼는 것이 핵심 요구라면 `List`보다 `Deque` 계약을 먼저 보는 편이 낫습니다. 이 용도에서는 `ArrayDeque` 같은 구현이 더 자연스러운 선택일 수 있습니다.

결국 두 구현을 비교할 때는 단순 Big-O 표보다 **실제 호출 한 번이 어떤 경로를 거치는지**를 그려 보는 것이 좋습니다. random access가 필요한지, 대부분 순회인지, 삽입 위치를 이미 알고 있는지, 그리고 애초에 필요한 추상화가 List인지부터 확인하면 됩니다.
