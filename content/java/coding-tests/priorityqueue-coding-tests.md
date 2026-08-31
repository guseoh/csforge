---
kind: concept
contentKey: java.core.coding-tests.priorityqueue-coding-tests
topicContentKey: java.core.coding-tests
slug: priorityqueue-coding-tests
title: "PriorityQueue in coding tests"
summary: "현재 최우선 원소를 반복해서 꺼내는 문제에서 PriorityQueue의 head·Comparator·동점 처리 규칙을 올바르게 사용한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html"
    title: "Java SE 25 API: PriorityQueue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: queue head, natural ordering, iterator ordering과 null 제한 확인
---
# 코딩테스트용 PriorityQueue

문제에서 매 단계마다 "현재 가장 작은 값", "가장 큰 값", "가장 우선순위 높은 작업"을 하나씩 꺼내야 한다면 매번 전체 목록을 다시 정렬하는 대신 `PriorityQueue`를 사용할 수 있습니다.

Java의 `PriorityQueue`를 사용할 때 가장 중요한 점은 **head의 우선순위만 보장하는 구조이지 전체 iteration이 정렬 순서를 보장하는 것은 아니라는 점**입니다.

### 기본 PriorityQueue는 가장 작은 원소가 head다

```java
PriorityQueue<Integer> queue = new PriorityQueue<>();
queue.offer(5);
queue.offer(1);
queue.offer(3);

System.out.println(queue.peek()); // 1
System.out.println(queue.poll()); // 1
System.out.println(queue.poll()); // 3
```

자연 순서를 사용하면 최소값이 head가 됩니다. `peek()`은 head를 확인하고 `poll()`은 head를 제거합니다.

### 최대값을 먼저 꺼내려면 Comparator를 바꾼다

```java
PriorityQueue<Integer> maxQueue =
        new PriorityQueue<>(Comparator.reverseOrder());
```

이제 comparator 기준에서 가장 앞선 값이 head가 됩니다. 단순 숫자 최대값뿐 아니라 여러 필드가 있는 객체의 우선순위도 표현할 수 있습니다.

```java
record Job(int priority, int id) { }

PriorityQueue<Job> jobs = new PriorityQueue<>(
        Comparator.comparingInt(Job::priority)
                .thenComparingInt(Job::id)
);
```

문제에서 동점 처리 규칙이 있다면 comparator에 반드시 포함해야 합니다.

### iterator가 전체 우선순위 순서라고 생각하면 안 된다

```java
for (int value : queue) {
    System.out.println(value);
}
```

이 순회 결과가 `poll()` 순서와 같다고 보장되지 않습니다. PriorityQueue 내부는 **head를 빠르게 선택하는 heap 성질**을 유지하지만 모든 위치를 정렬 배열처럼 유지하는 것이 아닙니다.

전체 우선순위 순서가 필요하면 값을 계속 `poll()`하거나 별도 복사본을 정렬하는 방법을 사용합니다.

### 값의 우선순위를 넣은 뒤 바꾸는 경우를 조심한다

```java
class Node {
    int distance;
}
```

Node를 PriorityQueue에 넣은 뒤 `distance` 값을 직접 바꿔도 queue가 그 변화를 보고 자동으로 heap 위치를 다시 정렬해 주는 것으로 생각하면 안 됩니다.

코딩테스트에서는 보통 immutable한 상태 묶음을 새로 넣는 방식이 안전합니다.

```java
record State(int distance, int node) { }
queue.offer(new State(newDistance, node));
```

최단 경로 같은 알고리즘에서 오래된 entry가 남으면 꺼낸 뒤 현재 최적값과 비교해 버리는 패턴이 등장할 수 있는데, 그 알고리즘적 이유는 DSA 영역에서 다룹니다.

### `peek()`과 `poll()`의 빈 상태를 확인한다

`peek()`과 `poll()`은 비어 있으면 null을 반환합니다. `element()`/`remove()` 계열은 빈 경우 예외를 던질 수 있습니다.

문제에서 queue가 비지 않는다고 보장하는지 확인하고, 반복 조건은 보통 `!queue.isEmpty()` 같은 방식으로 명확히 둡니다.

### 언제 전체 sort보다 PriorityQueue가 자연스러운가

알고리즘 선택 자체는 DSA 영역의 주제지만 Java 구현 관점에서는 다음 질문이 도움이 됩니다.

- 값을 모두 모은 뒤 한 번 정렬하는가?
- 값이 계속 추가되는 동안 현재 최우선 값이 반복해서 필요한가?

두 번째 형태라면 PriorityQueue API가 문제의 상태를 자연스럽게 표현하는 경우가 많습니다.

### 문제를 풀 때 확인할 것

1. 최소 우선인지 최대 우선인지 확인합니다.
2. 사용자 타입이면 Comparator의 모든 tie-breaker를 적습니다.
3. `peek`과 `poll` 중 제거가 필요한지 확인합니다.
4. iterator 순서를 정렬 결과로 사용하고 있지 않은지 봅니다.
5. queue에 넣은 객체의 우선순위 값을 나중에 직접 바꾸고 있지 않은지 확인합니다.

### 면접이나 문제 풀이에서 설명한다면

Java `PriorityQueue`는 comparator 또는 natural ordering 기준으로 head에 가장 우선되는 원소를 두는 queue입니다. 기본적으로 최소 원소가 head이며 최대 우선순위가 필요하면 comparator를 바꿀 수 있습니다. Heap은 전체 iteration 순서를 정렬해 주지 않으므로 정렬된 전체 결과가 필요하면 반복해서 poll해야 하며, 삽입된 객체의 비교 기준을 나중에 변경해도 자동 재배치되지 않는 점을 주의해야 합니다.
