---
kind: concept
contentKey: java.core.concurrency.locks-reentrantlock-condition
topicContentKey: java.core.concurrency
slug: locks-reentrantlock-condition
title: "Lock, ReentrantLock, and Condition"
summary: "명시적 Lock이 필요한 경우와 ReentrantLock의 획득·해제·Condition 대기 규칙을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/Lock.html"
    title: "Java SE 25 API: Lock"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: lock/unlock과 interruptible·timed acquisition의 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html"
    title: "Java SE 25 API: ReentrantLock"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 재진입과 fairness 설정의 계약 확인
---
# Lock·ReentrantLock·Condition

단순히 한 번에 한 thread만 critical section에 들어가면 된다면 `synchronized`는 매우 좋은 기본 선택입니다. Scope를 벗어날 때 monitor가 자동으로 해제되므로 lock 반환을 빠뜨릴 위험도 적습니다.

그런데 "lock을 500ms까지만 기다리고 포기하고 싶다", "lock을 기다리는 동안 interrupt에 반응하고 싶다", "한 lock 안에서 `notEmpty`와 `notFull`이라는 서로 다른 대기 조건을 관리하고 싶다" 같은 요구가 생기면 명시적인 `Lock` API가 필요할 수 있습니다.

### ReentrantLock은 명시적으로 획득하고 반드시 해제한다

```java
Lock lock = new ReentrantLock();

lock.lock();
try {
    updateSharedState();
} finally {
    lock.unlock();
}
```

`synchronized`와 달리 중괄호를 벗어난다고 자동으로 unlock되지 않습니다. 그래서 성공적으로 lock을 얻은 뒤에는 `finally`에서 반환하는 구조가 기본입니다.

```text
lock.lock()
    │
    ▼
critical section
    │
    └─ 정상/예외 모두
          ▼
     finally unlock()
```

Unlock을 놓치면 다른 thread가 계속 lock을 기다릴 수 있습니다.

### ReentrantLock도 같은 thread의 재진입을 허용한다

```java
lock.lock();
try {
    nested(); // nested에서도 같은 lock을 다시 획득할 수 있음
} finally {
    lock.unlock();
}
```

"Reentrant"는 같은 thread가 이미 가진 lock을 다시 획득할 수 있다는 뜻입니다. 획득 횟수에 맞게 unlock도 수행해야 최종적으로 다른 thread가 들어갈 수 있습니다.

### tryLock은 무한 대기 외의 선택지를 준다

```java
if (lock.tryLock(500, TimeUnit.MILLISECONDS)) {
    try {
        useResource();
    } finally {
        lock.unlock();
    }
} else {
    handleTimeout();
}
```

이런 API는 deadlock 위험이 있는 복잡한 lock 조합이나 제한된 대기 정책에서 유용할 수 있습니다. 하지만 timeout이 발생했을 때 **어떤 상태를 rollback하고 caller에게 무엇을 알려야 하는지**는 application이 설계해야 합니다.

`lockInterruptibly()`는 lock 획득 대기 자체가 interrupt에 반응해야 하는 경우 사용할 수 있습니다.

### Condition은 하나의 Lock 안에서 "어떤 상태가 될 때까지 기다린다"를 표현한다

Producer-consumer queue를 직접 만든다고 가정하겠습니다. Consumer는 queue가 비어 있지 않을 때까지 기다려야 합니다.

```java
final Lock lock = new ReentrantLock();
final Condition notEmpty = lock.newCondition();

Task take() throws InterruptedException {
    lock.lock();
    try {
        while (queue.isEmpty()) {
            notEmpty.await();
        }
        return queue.removeFirst();
    } finally {
        lock.unlock();
    }
}
```

`await()`는 기다리는 동안 현재 lock을 release하고, 깨어난 뒤 다시 lock을 획득한 다음 반환합니다. Lock을 계속 들고 기다리면 producer가 queue에 값을 넣으러 들어올 수 없기 때문입니다.

```text
consumer: lock -> queue empty -> await
                            │
                            └─ lock release + wait

producer:                   lock -> add -> signal -> unlock

consumer:                   wake -> lock reacquire -> condition 재확인
```

### `if`가 아니라 `while`로 조건을 다시 확인한다

```java
while (queue.isEmpty()) {
    notEmpty.await();
}
```

깨어났다는 사실만으로 queue가 반드시 원하는 상태라고 가정하면 안 됩니다. 여러 waiter가 경쟁할 수도 있고 spurious wakeup이 허용될 수 있으므로 **predicate를 다시 검사**합니다.

Condition은 "signal을 받았으니 작업해도 된다"가 아니라 "상태가 바뀌었을 수 있으니 lock을 다시 얻고 조건을 확인하라"는 구조로 보는 편이 좋습니다.

### 여러 Condition으로 대기 이유를 나눌 수 있다

Bounded queue라면 하나의 lock 아래에서:

- `notEmpty`: consumer가 기다림
- `notFull`: producer가 기다림

처럼 서로 다른 상태 조건을 나눌 수 있습니다. `Object.wait/notify`의 한 wait set보다 의도를 분리하기 좋은 경우가 있습니다.

### fairness는 공짜가 아니다

`new ReentrantLock(true)`로 fairness 정책을 요청할 수 있지만 이것이 "모든 thread가 완벽히 공평한 시간만큼 CPU를 받는다"는 의미는 아닙니다. Lock 획득 대기 정책과 관련한 선택이며 throughput에 비용이 있을 수 있습니다.

따라서 실제 starvation 요구가 있는지와 성능 특성을 보고 선택합니다.

### synchronized보다 항상 좋은 것은 아니다

| 요구                      | synchronized            | ReentrantLock         |
| ------------------------- | ----------------------- | --------------------- |
| 단순 상호 배제            | 간결                    | 가능                  |
| 자동 scope 기반 release   | O                       | X, finally 필요       |
| timed try                 | 제한적                  | `tryLock(timeout)`    |
| interruptible acquisition | 직접 지원 안 함         | `lockInterruptibly()` |
| 여러 wait condition       | 하나의 monitor wait set | 여러 `Condition` 가능 |

추가 기능이 필요하지 않다면 synchronized가 실수를 줄일 수 있습니다.

### 문제를 풀 때 확인할 것

1. lock을 성공적으로 획득한 모든 경로에 unlock이 있는지 봅니다.
2. `finally`에서 release되는지 확인합니다.
3. timed/interruptible 획득의 실패 경로를 추적합니다.
4. `Condition.await()` 전 lock을 소유하고 있는지 봅니다.
5. 깨어난 뒤 조건을 `while`로 다시 검사하는지 확인합니다.

### 면접에서 설명한다면

`ReentrantLock`은 `synchronized`와 같은 mutual exclusion과 memory synchronization을 제공하면서 timed/interruptible acquisition, 여러 `Condition` 같은 명시적 기능을 제공합니다. 대신 lock/unlock lifecycle을 직접 관리해야 하므로 보통 `try/finally`가 필요합니다. Condition의 `await()`는 기다리는 동안 lock을 놓고, 깨어나 lock을 다시 획득한 뒤 predicate를 재확인해야 합니다. 추가 기능이 필요 없다면 synchronized가 더 단순한 선택일 수 있습니다.
