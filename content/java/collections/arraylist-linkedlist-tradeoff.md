---
kind: concept
contentKey: java.core.collections.arraylist-linkedlist-tradeoff
topicContentKey: java.core.collections
slug: arraylist-linkedlist-tradeoff
title: "ArrayList와 LinkedList의 선택"
summary: "배열 기반 저장과 연결 노드의 접근·삽입 비용을 실제 사용 패턴으로 비교한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html"
    title: "ArrayList API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: resizable-array 구현과 성능 특성 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedList.html"
    title: "LinkedList API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: doubly-linked list 구현과 deque 역할 확인
---
# ArrayList와 LinkedList의 선택

## 쉬운 진입

`ArrayList`는 책장처럼 index로 바로 찾기 좋고, `LinkedList`는 책 사이에 연결 고리를 끼우는
구조다. “삽입이 O(1)”이라는 한 문장만으로 선택하지 말고 삽입 위치를 찾는 비용까지 봐야 한다.

## 정확한 메커니즘

```text
ArrayList: [A][B][C][ ][ ]  -> index 접근 빠름, 중간 삽입 시 이동
LinkedList: A <-> B <-> C   -> 위치를 잡은 ListIterator로 삽입, index 탐색은 별도
```

ArrayList는 크기 조정 가능한 배열로 index 접근이 상수 시간에 가깝고, 중간 삽입/삭제는
뒤 원소 이동이 필요하다. LinkedList는 양방향 node 연결이며 index 접근은 앞/뒤에서 순회한다.
LinkedList의 `add(index, value)`는 위치 탐색 비용과 연결 변경 비용을 구분해야 한다.
이미 해당 위치를 순회 중인 `ListIterator.add()`는 위치 탐색을 반복하지 않는다. 공개 API로
내부 node를 직접 넘기지는 않는다. `addFirst`나 `add(0, value)`는 임의의 중간 index 탐색과
달리 앞쪽 끝에 바로 삽입한다.

JDK의 배열 기반 저장은 참조 슬롯 순회에서 locality에 유리할 수 있고, LinkedList는 node
할당과 링크 추적 비용이 있다. 이는 구현·JVM·하드웨어와 workload에 따른 실용적 판단이다.
Java 언어가 객체의 물리 메모리 연속 배치나 캐시 적중률을 보장한다는 뜻은 아니다.

## 실전·면접 연결

일반적인 순차 읽기·끝 추가·index 접근 중심이면 ArrayList가 기본 선택이다. 큐/덱 동작은
대개 LinkedList보다 `ArrayDeque`가 더 직접적이다. 성능 결론은 벤치마크와 사용 패턴으로 확인한다.

## 흔한 오해

- LinkedList의 임의 index 삽입이 항상 빠른 것은 아니다. iterator 위치 확보 비용을 따져야 한다.
- ArrayList의 끝 추가가 모든 순간 O(1)인 것은 아니며 resize 때 복사가 발생한다.
- 메모리 구조의 Big-O만으로 CPU cache와 실제 성능을 모두 설명할 수 없다.
