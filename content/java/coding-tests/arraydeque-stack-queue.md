---
kind: concept
contentKey: java.core.coding-tests.arraydeque-stack-queue
topicContentKey: java.core.coding-tests
slug: arraydeque-stack-queue
title: "ArrayDeque stack and queue"
summary: "ArrayDeque의 양 끝 연산을 일관되게 사용해 stack·queue·deque 문제를 구현한다"
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html"
    title: "Java SE 25 API: ArrayDeque"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: head·tail 삽입/조회/제거 API와 null 제한 확인
---
# ArrayDeque로 stack·queue 사용하기

`ArrayDeque`는 앞과 뒤 양쪽에서 값을 넣고 뺄 수 있는 deque 구현입니다. 코딩테스트에서는 같은 타입을 **queue, stack, 양방향 deque**로 사용할 수 있어 자주 등장합니다.

핵심은 메서드 이름을 많이 외우는 것보다 "나는 어느 쪽에 넣고 어느 쪽에서 뺄 것인가"를 처음부터 일관되게 정하는 것입니다.

### Queue로 사용할 때는 뒤에 넣고 앞에서 뺀다

FIFO queue는 먼저 들어온 값이 먼저 나옵니다.

```java
Deque<Integer> queue = new ArrayDeque<>();

queue.addLast(10);
queue.addLast(20);
queue.addLast(30);

System.out.println(queue.pollFirst()); // 10
System.out.println(queue.pollFirst()); // 20
```

```text
front                    back
  ↓                        ↓
[10] [20] [30]
  ↑              ↑
pollFirst       addLast
```

`offerLast`/`pollFirst` 조합을 사용할 수도 있습니다. 한 문제 안에서 방향을 섞지만 않으면 됩니다.

### Stack으로 사용할 때는 같은 쪽에서 넣고 뺀다

LIFO stack은 마지막에 넣은 값이 먼저 나옵니다.

```java
Deque<Integer> stack = new ArrayDeque<>();

stack.push(10);
stack.push(20);
stack.push(30);

System.out.println(stack.pop()); // 30
```

`push`와 `pop`은 deque의 앞쪽을 stack top으로 사용하는 API입니다.

```text
top
 ↓
[30] [20] [10]
 ↑
push / pop
```

직접 `addLast`/`removeLast`를 한 쌍으로 사용해도 LIFO를 만들 수 있지만, `push/pop`은 stack 의도를 더 바로 보여 줄 수 있습니다.

### `poll`과 `remove`는 비었을 때 동작이 다르다

문제에서 빈 deque를 만날 가능성이 있다면 API 차이가 중요합니다.

- `pollFirst()`, `pollLast()`: 비어 있으면 `null`
- `removeFirst()`, `removeLast()`: 비어 있으면 예외
- `peekFirst()`, `peekLast()`: 제거하지 않고 조회, 비어 있으면 `null`
- `getFirst()`, `getLast()`: 제거하지 않고 조회, 비어 있으면 예외

문제에서 항상 원소가 있다고 보장하면 어떤 계열을 써도 구현할 수 있지만, 보장이 없다면 null/예외 처리를 고려합니다.

### peek과 poll을 헷갈리지 않는다

```java
Deque<Integer> queue = new ArrayDeque<>();
queue.addLast(10);

int a = queue.peekFirst(); // 10, 그대로 남음
int b = queue.pollFirst(); // 10, 제거됨
```

BFS나 시뮬레이션에서 peek만 해 놓고 제거했다고 생각하면 같은 원소를 계속 처리할 수 있습니다.

### ArrayDeque는 null 원소를 허용하지 않는다

`poll` 계열이 빈 상태를 `null`로 표현하기 때문에 실제 값으로 null을 저장하지 않습니다.

```java
Deque<String> deque = new ArrayDeque<>();
// deque.add(null); // 허용되지 않음
```

따라서 `null`을 실제 데이터로 구분해야 하는 문제라면 다른 모델을 사용해야 합니다.

### 이 Concept은 알고리즘보다 Java 구현 도구에 집중한다

BFS에서 queue를 왜 쓰는지, DFS에서 stack을 어떻게 사용하는지는 Data Structures & Algorithms 영역에서 다룹니다. 여기서는 이미 선택한 자료구조를 **Java의 `ArrayDeque` API로 실수 없이 구현하는 것**이 목표입니다.

### 문제를 풀 때 확인할 것

1. FIFO인지 LIFO인지, 양 끝을 모두 쓰는지 결정합니다.
2. 어느 쪽을 front/top으로 사용할지 정합니다.
3. 넣기·빼기 방향을 문제 전체에서 일관되게 유지합니다.
4. 빈 상태가 가능한지 보고 poll/remove 계열을 선택합니다.
5. peek이 제거하지 않는다는 점을 확인합니다.

### 면접이나 문제 풀이에서 설명한다면

`ArrayDeque`는 양 끝 삽입·제거가 가능한 deque라서 queue와 stack을 모두 표현할 수 있습니다. Queue로는 보통 뒤에 넣고 앞에서 빼며, stack으로는 `push/pop` 같은 한쪽 끝 연산을 사용합니다. `poll`은 빈 경우 null, `remove`는 예외라는 차이와 null 원소를 허용하지 않는다는 점을 알아 두면 좋습니다.
