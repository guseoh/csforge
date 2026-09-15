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

`PriorityQueue`는 원소 전체를 정렬된 List처럼 유지해서 보여 주는 컬렉션이 아닙니다. 핵심은 **현재 비교 기준상 가장 우선하는 원소를 head에서 확인하고 반복해서 꺼내는 것**입니다.

![PriorityQueue의 heap 성질과 poll 순서](/learning/java/priority-queue-heap.svg)

기본 자연 순서에서는 가장 작은 원소가 head가 됩니다.

```java
PriorityQueue<Integer> queue = new PriorityQueue<>();
queue.offer(30);
queue.offer(10);
queue.offer(20);

System.out.println(queue.peek()); // 10
System.out.println(queue.poll()); // 10
```

### heap 성질과 전체 정렬은 다르다

PriorityQueue는 head가 가장 우선한다는 heap 성질을 유지합니다. 내부의 모든 위치가 완전한 오름차순일 필요는 없습니다.

```text
        1
      /   \
     4     3
    / \   / \
   9   7 8   5
```

그래서 iterator로 순회한 결과를 정렬된 결과라고 가정하면 안 됩니다.

```java
for (int value : queue) {
    System.out.println(value);
}
```

우선순위 순서로 모두 꺼내고 싶다면 `poll()`을 반복해야 합니다. 매번 현재 head를 제거하고 다음 head가 정해지기 때문에 비교 기준에 따른 순서로 값을 얻을 수 있지만, **원본 queue는 그 과정에서 소모됩니다.**

### Comparator가 우선순위의 의미를 정한다

```java
PriorityQueue<Integer> maxQueue =
        new PriorityQueue<>(Comparator.reverseOrder());
```

객체라면 여러 기준을 조합할 수도 있습니다.

```java
PriorityQueue<Job> jobs = new PriorityQueue<>(
        Comparator.comparingInt(Job::priority)
                .thenComparingLong(Job::sequence)
);
```

같은 priority 안에서도 처리 순서를 보장해야 한다면 `sequence` 같은 tie-breaker를 명시해야 합니다. 같은 우선순위라는 이유만으로 삽입 순서가 자동으로 보장된다고 생각하면 안 됩니다.

### 비교 기준에 참여하는 상태를 넣은 뒤 바꾸면 위험하다

```java
Job job = new Job(5);
queue.offer(job);
job.changePriority(1);
```

PriorityQueue는 원소 내부 상태 변화를 관찰해 자동으로 heap 위치를 다시 계산하지 않습니다. 비교 기준이 달라졌는데 기존 위치는 그대로라면 `peek()`가 기대와 다른 원소를 반환할 수 있습니다.

따라서 queue에 들어 있는 동안 ordering에 영향을 주는 상태는 안정적으로 유지하는 편이 안전합니다. 우선순위를 바꿔야 한다면 제거한 뒤 변경하고 다시 넣는 등의 명시적인 갱신이 필요할 수 있습니다.

### 언제 PriorityQueue가 자연스러운가

모든 원소를 항상 정렬된 목록으로 보여 주는 문제보다 **매 순간 다음 하나를 선택하는 문제**에 잘 맞습니다. 작업 우선순위 처리, top-k의 현재 경계 관리, Dijkstra에서 다음 후보 선택 같은 경우가 대표적입니다.

이때 Java 학습의 핵심은 heap 구현 알고리즘 자체보다 API 계약입니다. `peek`와 `poll`이 head를 다룬다는 점, iterator가 정렬 순서를 보장하지 않는다는 점, Comparator가 우선순위를 정의한다는 점을 구분하면 됩니다.
