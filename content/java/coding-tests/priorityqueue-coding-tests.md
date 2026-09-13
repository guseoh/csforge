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

문제에서 매 단계마다 "현재 가장 작은 값", "가장 큰 값", "가장 우선순위 높은 작업"을 하나씩 꺼내야 한다면 매번 전체 목록을 다시 정렬하는 대신 `PriorityQueue`를 사용할 수 있습니다.

Java의 `PriorityQueue`를 사용할 때 가장 중요한 점은 **Comparator 기준의 head를 빠르게 얻기 위한 queue이지 내부 전체가 정렬 배열처럼 유지되는 구조는 아니라는 점**입니다.

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

자연 순서를 사용하면 최소값이 head가 됩니다. `peek()`은 head를 확인하고 제거하지 않으며 `poll()`은 현재 head를 제거해서 반환합니다.

```text
offer(5), offer(1), offer(3)
            │
            ▼
      PriorityQueue
            │
            └─ head = 1
                  │
          peek ───┤ 조회만
          poll ───┘ 제거 후 반환
```

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

문제에서 동점 처리 규칙이 있다면 comparator에 포함해야 합니다. `priority`만 같다고 아무 순서나 허용되는지, `id`까지 비교해야 하는지를 문제 문장에서 확인합니다.

### iterator의 순서를 정렬 결과로 사용하면 안 된다

```java
for (int value : queue) {
    System.out.println(value);
}
```

이 순회 결과가 `poll()` 순서와 같다고 보장되지 않습니다. PriorityQueue는 **head가 comparator 기준의 최소 원소**라는 계약을 제공하지만 iterator가 모든 원소를 priority 순서로 방문한다는 계약은 제공하지 않습니다.

```text
보장되는 관점
peek/poll -> 현재 comparator 기준 head

보장되지 않는 관점
for-each / iterator -> 전체 정렬 순서
```

전체 우선순위 순서가 필요하면 queue를 소비하며 계속 `poll()`하거나, 원본을 보존해야 한다면 복사한 뒤 poll하거나 별도 정렬을 사용합니다.

### queue에 넣은 뒤 비교 기준 필드를 바꾸지 않는다

다음과 같은 mutable 객체를 생각해 보겠습니다.

```java
class Node {
    int distance;
}
```

`Node`를 PriorityQueue에 넣은 뒤 `distance`를 직접 바꾸더라도 queue가 그 변화를 관찰해서 자동으로 heap 위치를 다시 배치한다고 생각하면 안 됩니다.

```text
offer(Node distance=10)
        │
        ▼
heap은 10을 기준으로 배치
        │
외부에서 distance=1로 변경
        │
        └─ 자동 reheapify 보장 없음
```

코딩테스트에서는 비교 기준을 생성 후 바꾸지 않는 작은 상태 객체를 새로 넣는 방식이 안전한 경우가 많습니다.

```java
record State(int distance, int node) { }

queue.offer(new State(newDistance, node));
```

최단 경로처럼 같은 node에 대한 오래된 entry가 queue에 남을 수 있는 문제에서는 꺼낸 값이 아직 유효한 상태인지 검사하는 패턴이 등장할 수 있습니다. 왜 그런 알고리즘이 필요한지는 DSA 영역에서 다루고, 여기서는 **PriorityQueue가 이미 삽입된 원소의 비교 key 변경을 추적하지 않는다**는 Java API 관점을 잡습니다.

### 같은 우선순위의 원소 사이 순서는 자동으로 FIFO가 아니다

Comparator가 두 원소를 0으로 판단할 때 PriorityQueue가 그 둘을 입력 순서대로 반환한다고 기대하면 안 됩니다. 안정 정렬이나 FIFO tie-breaking이 필요하다면 그 기준을 comparator에 직접 포함해야 합니다.

예를 들어 먼저 들어온 작업을 먼저 처리해야 한다면 입력 순번을 함께 저장할 수 있습니다.

```java
record Job(int priority, long sequence) { }

Comparator<Job> order = Comparator
        .comparingInt(Job::priority)
        .thenComparingLong(Job::sequence);
```

이때 `sequence`를 추가하는 것은 PriorityQueue의 기본 특성이 아니라 **문제에서 요구하는 tie-breaker를 데이터와 comparator에 명시하는 것**입니다.

### 빈 queue의 `peek()`과 `poll()`은 null을 반환한다

`peek()`과 `poll()`은 queue가 비어 있으면 `null`을 반환합니다. 반면 `element()`/`remove()` 계열은 빈 경우 예외를 던질 수 있습니다.

코딩테스트에서는 보통 다음처럼 상태를 명확히 검사합니다.

```java
while (!queue.isEmpty()) {
    int value = queue.poll();
    // 처리
}
```

PriorityQueue는 `null` 원소를 허용하지 않으므로 빈 상태의 `null`과 실제 원소가 충돌하지 않습니다.

### 시간 복잡도도 API 선택 이유와 연결한다

Java SE 25 API는 `offer`/`add`와 `poll`의 시간 복잡도를 `O(log n)`, `peek`을 상수 시간으로 명시합니다. 코딩테스트에서는 "현재 최우선 값을 반복해서 추가·제거한다"는 형태에서 이 성질이 중요합니다.

다만 이 Concept의 목적은 heap 알고리즘을 다시 증명하는 것이 아니라, 문제 해결 과정에서 PriorityQueue를 선택했다면 **Java API의 head·삽입·제거·iteration 계약을 정확히 사용**하는 것입니다.

### 문제를 풀 때 확인할 것

1. 최소 우선인지 최대 우선인지 확인합니다.
2. 사용자 타입이면 Comparator의 모든 필요한 tie-breaker를 적습니다.
3. `peek`과 `poll` 중 제거가 필요한지 확인합니다.
4. iterator 순서를 정렬 결과로 사용하고 있지 않은지 봅니다.
5. queue에 넣은 객체의 비교 기준 필드를 나중에 직접 바꾸고 있지 않은지 확인합니다.
6. 동점일 때 입력 순서까지 필요한지 문제 계약을 확인합니다.

### 학습 후 스스로 설명해 보기

Java `PriorityQueue`는 comparator 또는 natural ordering 기준으로 head에 가장 우선되는 원소를 두는 queue입니다. 기본적으로 최소 원소가 head이고 최대 우선순위가 필요하면 comparator를 바꿀 수 있습니다. 전체 iterator 순서는 정렬을 보장하지 않으며, 삽입된 객체의 비교 기준 필드를 나중에 변경해도 자동으로 재배치되지 않습니다. 동점에서 특정 순서가 필요하면 문제의 tie-breaker를 comparator에 직접 포함해야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. PriorityQueue를 for-each로 순회하면 우선순위 순서대로 나오나요?

아닙니다. PriorityQueue가 보장하는 핵심은 comparator 기준의 head입니다. 전체 iteration order는 정렬 순서가 아니므로 priority 순서 전체가 필요하다면 반복해서 `poll()`하거나 별도 정렬을 사용해야 합니다.

#### Q. PriorityQueue에 객체를 넣은 뒤 comparator가 보는 필드를 수정하면 자동으로 위치가 바뀌나요?

그런 보장은 없습니다. Queue는 삽입 이후 객체 내부 필드의 변경을 감시해서 reheapify하지 않습니다. 비교 key가 바뀌어야 한다면 기존 원소를 적절히 제거·재삽입하거나, 코딩테스트에서는 immutable 상태를 새 entry로 넣고 꺼낼 때 유효성을 확인하는 방식 등을 문제 알고리즘에 맞게 선택합니다.
