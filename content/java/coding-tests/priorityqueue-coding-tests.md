---
kind: concept
contentKey: java.core.coding-tests.priorityqueue-coding-tests
topicContentKey: java.core.coding-tests
slug: priorityqueue-coding-tests
title: "코딩 테스트의 PriorityQueue"
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
    relationNote: queue head, natural ordering, iterator ordering, null 제한과 시간 복잡도 계약 확인
---
# 코딩 테스트의 PriorityQueue

문제에서 매 단계마다 "현재 가장 작은 값", "가장 큰 값", "가장 우선순위 높은 작업"을 하나씩 선택해야 한다면 `PriorityQueue`가 자연스러운 도구가 될 수 있습니다.

여기서 중요한 것은 PriorityQueue가 **전체 원소를 정렬된 List처럼 보여 주는 구조가 아니라 comparator 기준의 head를 반복해서 꺼내기 위한 queue**라는 점입니다.

### 기본 PriorityQueue는 자연 순서의 최소값이 head다

```java
PriorityQueue<Integer> queue = new PriorityQueue<>();
queue.offer(5);
queue.offer(1);
queue.offer(3);

System.out.println(queue.peek()); // 1
System.out.println(queue.poll()); // 1
System.out.println(queue.poll()); // 3
```

`peek()`은 head를 조회만 하고, `poll()`은 head를 제거해서 반환합니다.

최대값을 먼저 꺼내고 싶다면 comparator를 바꿉니다.

```java
PriorityQueue<Integer> maxQueue =
        new PriorityQueue<>(Comparator.reverseOrder());
```

### 사용자 타입은 문제의 tie-breaker까지 Comparator에 넣는다

```java
record Job(int priority, int id) { }

PriorityQueue<Job> jobs = new PriorityQueue<>(
        Comparator.comparingInt(Job::priority)
                .thenComparingInt(Job::id)
);
```

Priority가 같을 때 id 오름차순이라는 조건이 문제에 있다면 두 번째 기준까지 필요합니다. 같은 우선순위의 원소가 자동으로 입력 순서대로 나온다고 기대하면 안 됩니다.

입력 순서가 실제 tie-breaker라면 sequence를 데이터에 포함해 명시할 수 있습니다.

```java
record Job(int priority, long sequence) { }
```

### iterator 순서를 정렬 결과로 사용하지 않는다

```java
for (int value : queue) {
    System.out.println(value);
}
```

PriorityQueue가 보장하는 것은 comparator 기준의 head이지 전체 iterator 순서가 아닙니다. 모든 값을 우선순위 순서로 얻고 싶다면 `poll()`을 반복해야 합니다.

원본 queue를 유지해야 한다면 복사본을 만들어 소비하거나 다른 정렬 방법을 선택할 수 있습니다.

### 삽입한 뒤 비교 기준 필드를 직접 바꾸지 않는다

```java
class Node {
    int distance;
}
```

Node를 queue에 넣은 뒤 `distance`만 바꿔도 PriorityQueue가 자동으로 위치를 다시 정렬해 준다는 보장은 없습니다.

코딩테스트에서는 immutable 상태를 새 entry로 넣는 방식이 단순한 경우가 많습니다.

```java
record State(int distance, int node) { }
queue.offer(new State(newDistance, node));
```

최단 경로처럼 예전 entry가 남을 수 있는 알고리즘에서는 꺼낸 값의 유효성을 별도로 검사할 수 있지만, 그 이유는 알고리즘 Topic에서 다룹니다. 여기서의 Java API 핵심은 **이미 삽입된 원소 내부의 priority 변경을 queue가 추적하지 않는다**는 점입니다.

### 빈 상태의 API 차이도 알아 둔다

`peek()`과 `poll()`은 비어 있으면 `null`을 반환하고, `element()`과 `remove()` 계열은 예외를 던질 수 있습니다. 일반적인 코딩테스트에서는 다음처럼 빈 상태를 명시적으로 확인하는 경우가 많습니다.

```java
while (!queue.isEmpty()) {
    State state = queue.poll();
    // 처리
}
```

PriorityQueue 문제에서는 최소/최대 방향, tie-breaker, `peek`과 `poll`의 차이, iterator 순서 비보장, 삽입 뒤 priority 상태 변경 여부를 확인하세요. Heap 내부 구현을 다시 증명하기보다 **문제가 요구하는 다음 원소 선택을 Java API 계약에 맞게 표현하는 것**이 목표입니다.
