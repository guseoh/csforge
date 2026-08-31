---
kind: concept
contentKey: java.core.collections.priorityqueue
topicContentKey: java.core.collections
slug: priorityqueue
title: "PriorityQueue와 우선순위 처리"
summary: "전체 정렬 목록이 아니라 현재 우선순위가 가장 높은 원소를 반복해서 꺼내는 구조로 PriorityQueue를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html"
    title: "Java SE 25 API: PriorityQueue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: heap 기반 priority queue의 head와 iteration 계약 확인
---
# PriorityQueue와 우선순위 처리

`PriorityQueue`는 원소 전체를 정렬된 List처럼 보여 주는 컬렉션이 아닙니다. 핵심 목적은 **현재 가장 우선순위가 높은 원소를 빠르게 확인하고 제거하는 것**입니다.

기본 자연 순서에서는 가장 작은 원소가 head가 됩니다.

```java
PriorityQueue<Integer> queue = new PriorityQueue<>();
queue.offer(30);
queue.offer(10);
queue.offer(20);

System.out.println(queue.peek()); // 10
System.out.println(queue.poll()); // 10
```

### 내부 배열을 출력한 순서가 정렬 결과는 아니다

PriorityQueue는 heap 성질을 유지합니다. heap에서는 부모와 자식 사이의 우선순위 조건을 만족하면 되지 모든 원소가 배열상 완전한 정렬 순서일 필요는 없습니다.

따라서 다음처럼 순회하면 전체 오름차순을 기대하면 안 됩니다.

```java
for (int value : queue) {
    System.out.println(value);
}
```

정렬 순서로 모두 꺼내고 싶다면 `poll()`을 반복해야 합니다. 단 그 과정은 queue를 비웁니다.

### 최대값 우선 queue도 만들 수 있다

```java
PriorityQueue<Integer> maxQueue =
        new PriorityQueue<>(Comparator.reverseOrder());
```

객체라면 `Comparator.comparing...`을 이용해 우선순위를 명시할 수 있습니다.

### 언제 적합한가

- 작업 중 가장 작은/큰 값 하나를 반복해서 선택할 때
- top-k 문제
- 일정 우선순위의 작업 처리
- Dijkstra 같은 알고리즘에서 다음 후보 선택

알고리즘 이론 자체는 DSA 영역에서 다루고, Java에서는 PriorityQueue API와 comparator 사용을 익히면 됩니다.

### 흔한 실수

queue 안에 넣은 객체의 우선순위 기준 필드를 나중에 바꾸면 이미 구성된 heap이 자동으로 재정렬된다고 기대하면 안 됩니다. 필요하다면 제거 후 다시 넣는 등 명시적인 갱신 전략이 필요합니다.

문제에서는 `peek/poll`이 무엇을 반환하는지와 **iteration order는 sorted order가 아니라는 점**을 특히 확인하세요.
