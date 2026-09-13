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

### heap property와 전체 정렬은 다르다

PriorityQueue는 heap 성질을 유지합니다. 최소 우선순위 queue라면 부모가 자식보다 우선하는 관계를 유지하면 되므로, 내부의 모든 위치가 완전한 오름차순일 필요는 없습니다.

```text
        1
      /   \
     4     3
    / \   / \
   9   7 8   5
```

이 구조에서 head인 `1`은 바로 꺼낼 수 있습니다. 하지만 같은 level의 `4`, `3`이나 그 아래 원소가 전체 정렬 순서로 놓여 있다고 가정하면 안 됩니다.

따라서 다음처럼 순회했을 때 `1, 3, 4, 5, 7, 8, 9` 같은 전체 정렬 순서를 기대하면 안 됩니다.

```java
for (int value : queue) {
    System.out.println(value);
}
```

정렬 순서로 모두 꺼내고 싶다면 `poll()`을 반복해야 합니다. 매번 현재 head를 제거한 뒤 heap 조건을 다시 맞추기 때문에 우선순위 순서로 값을 얻을 수 있지만, 그 과정에서 원본 queue는 비워집니다.

### 최대값 우선 queue도 만들 수 있다

```java
PriorityQueue<Integer> maxQueue =
        new PriorityQueue<>(Comparator.reverseOrder());
```

객체라면 `Comparator.comparing...`을 이용해 우선순위를 명시할 수 있습니다.

```java
PriorityQueue<Job> jobs = new PriorityQueue<>(
        Comparator.comparingInt(Job::priority)
                .thenComparingLong(Job::sequence)
);
```

동일한 priority 안에서도 처리 순서를 제품 계약으로 보장해야 한다면 `sequence`처럼 tie-breaker를 명시해야 합니다. 같은 우선순위라고 해서 PriorityQueue가 삽입 순서를 자동으로 보장한다고 가정하면 안 됩니다.

### 언제 적합한가

PriorityQueue는 모든 원소를 정렬된 상태로 화면에 보여 주려는 문제보다 **매 순간 다음 하나를 선택하는 문제**에 잘 맞습니다.

- 작업 중 가장 작은/큰 값 하나를 반복해서 선택할 때
- top-k 문제에서 현재 경계 원소를 관리할 때
- 일정 우선순위의 작업 처리
- Dijkstra 같은 알고리즘에서 다음 후보 선택

알고리즘 이론 자체는 DSA 영역에서 다루고, Java에서는 PriorityQueue API와 comparator 사용을 익히면 됩니다.

### 넣은 뒤 비교 기준을 바꾸면 heap이 자동으로 다시 정렬되지 않는다

```java
Job job = new Job(5);
queue.offer(job);

job.changePriority(1);
```

queue 안에 있는 객체의 priority가 바뀌었다고 해서 PriorityQueue가 그 변경을 관찰해 자동으로 위치를 다시 계산하지는 않습니다. 이 상태에서는 `peek()`가 기대한 작업을 반환하지 않을 수 있습니다.

우선순위를 변경해야 한다면 보통 기존 원소를 제거한 뒤 값을 바꾸고 다시 넣는 식으로 heap 구조를 명시적으로 갱신합니다. 이때 `remove(Object)`의 탐색 비용도 함께 고려해야 합니다.

### queue를 소모해도 되는지까지 호출 계약에 포함한다

정렬된 결과가 필요하다고 다음처럼 `poll()`을 반복하면 원본 queue가 비워집니다.

```java
while (!queue.isEmpty()) {
    System.out.println(queue.poll());
}
```

읽기만 해야 한다면 복사본을 만들어 소모하거나, 애초에 전체 정렬 결과가 필요한 요구라면 다른 자료 구조와 `sort`를 검토할 수 있습니다. 자료 구조의 API뿐 아니라 **조회가 원본 상태를 바꾸는지**도 호출 계약의 일부입니다.

### 면접에서 이렇게 나옵니다

#### Q. PriorityQueue에 값이 들어 있으면 iterator도 정렬된 순서로 나오나요?

아닙니다. PriorityQueue가 보장하는 핵심은 현재 head가 비교 기준상 가장 우선한다는 점입니다. heap 내부 전체가 정렬된 배열인 것은 아니므로 iterator의 순서를 정렬 결과로 사용하면 안 됩니다. 정렬 순서로 모두 꺼내려면 `poll()`을 반복하거나 별도의 정렬을 사용해야 합니다.

#### Q. queue 안 객체의 priority 필드를 바꾸면 자동으로 재배치되나요?

자동으로 재배치된다고 가정하면 안 됩니다. PriorityQueue는 원소 내부 필드 변화를 감시하지 않습니다. 비교 결과가 달라지는 값을 변경했다면 제거 후 재삽입처럼 heap 구조를 다시 맞추는 명시적인 갱신 전략이 필요합니다.
