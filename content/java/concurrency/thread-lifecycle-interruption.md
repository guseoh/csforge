---
kind: concept
contentKey: java.core.concurrency.thread-lifecycle-interruption
topicContentKey: java.core.concurrency
slug: thread-lifecycle-interruption
title: "Thread lifecycle and interruption"
summary: "Thread의 시작·대기·종료 흐름과 interrupt가 강제 종료가 아닌 협력적 중단 신호라는 점을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: start, join, interrupt, sleep와 Thread.State 계약 확인
---
# Thread lifecycle과 interruption

`new Thread(...)`로 객체를 만들었다고 새 실행 흐름이 이미 시작된 것은 아닙니다. `Thread`는 생성되고, `start()`를 통해 실행 가능해지고, 작업이 끝나면 종료됩니다. 중간에는 lock이나 다른 thread를 기다리거나 일정 시간 잠들 수도 있습니다.

이 흐름을 알아야 `interrupt()`를 "thread를 즉시 죽이는 명령"으로 오해하지 않을 수 있습니다.

### `run()`과 `start()`는 의미가 다르다

```java
Thread worker = new Thread(() -> doWork());
worker.start();
```

`start()`는 새 thread가 `run()`의 작업을 실행할 수 있도록 시작합니다.

반대로 다음 코드는 새 thread를 시작하지 않습니다.

```java
worker.run();
```

이 경우 평범한 메서드 호출처럼 **현재 호출 thread에서** `run()`이 실행됩니다.

```text
worker.start()
     │
     └─ 새 Thread 실행 흐름 -> run()

worker.run()
     │
     └─ 현재 Thread에서 일반 메서드 호출
```

### Thread.State는 Java가 보여 주는 상태 모델이다

Java는 대표적으로 다음 상태를 제공합니다.

- `NEW`: 아직 시작되지 않음
- `RUNNABLE`: JVM에서 실행 가능한 상태
- `BLOCKED`: monitor lock 진입을 기다림
- `WAITING`: 시간 제한 없이 특정 조건을 기다림
- `TIMED_WAITING`: 시간 제한을 두고 기다림
- `TERMINATED`: 실행 종료

이 상태 이름을 OS scheduler의 내부 상태와 1:1로 대응시키면 안 됩니다. 예를 들어 `RUNNABLE`은 Java가 관찰하는 상태이며 "지금 이 순간 CPU core에서 실제 명령을 실행 중"이라는 뜻만은 아닙니다.

### `join()`은 다른 thread의 종료를 기다린다

```java
worker.start();
worker.join();
System.out.println("worker 완료 이후 실행");
```

현재 thread는 `worker`가 종료될 때까지 기다립니다. `join()`은 단순 편의 기능만이 아니라 Java Memory Model에서도 중요한 관계를 가집니다. worker에서 수행한 작업은 다른 thread가 성공적으로 `join()`에서 돌아온 이후의 작업과 연결되는 memory consistency 보장을 가집니다.

### interrupt는 "중단 요청"이다

```java
worker.interrupt();
```

이 호출이 worker의 코드를 임의의 위치에서 강제로 끝내는 것은 아닙니다. 대상 thread가 interrupt 상태를 확인하거나 interruptible blocking API에서 신호를 받아 **스스로 종료·정리 정책을 수행해야 합니다.**

```java
while (!Thread.currentThread().isInterrupted()) {
    doSmallUnit();
}
```

이런 형태에서는 각 작은 작업 사이에서 중단 요청을 확인하고 loop를 빠져나올 수 있습니다.

### `InterruptedException`이 발생하면 interrupt 상태를 어떻게 할지 결정해야 한다

`sleep`, `join`, `wait` 등 일부 대기 작업은 interrupt를 받으면 `InterruptedException`을 던질 수 있습니다.

```java
try {
    Thread.sleep(1_000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    return;
}
```

`InterruptedException`이 발생할 때 interrupt status가 지워질 수 있기 때문에, 현재 메서드가 중단 요청을 완전히 처리하지 않고 상위 호출자도 알아야 한다면 다시 `interrupt()`하여 상태를 복구하는 패턴을 사용할 수 있습니다.

하지만 "catch하면 무조건 다시 interrupt"도 절대 규칙은 아닙니다. 현재 계층이 취소를 최종 처리해 종료할 수도 있고 예외를 상위로 전달할 수도 있습니다. 핵심은 **중단 신호를 조용히 잃어버리지 않는 정책**입니다.

### `Thread.interrupted()`와 `isInterrupted()`도 구분한다

현재 thread의 interrupt 여부를 확인하는 API 가운데는 상태를 조회하면서 지우는 동작이 있는 API와 단순 조회하는 API가 있습니다. 따라서 문제에서 반복적으로 interrupt 상태를 검사할 때 어떤 메서드를 호출하는지 확인해야 합니다.

단순히 이름이 비슷하다고 같은 결과를 기대하면 취소 신호를 실수로 없앨 수 있습니다.

### Executor의 취소도 결국 작업이 협력해야 한다

`Future.cancel(true)`처럼 작업 thread에 interrupt를 요청하는 API가 있어도 작업이 interrupt를 무시하거나 중단할 수 없는 외부 호출에 오래 묶여 있다면 즉시 끝난다는 보장은 없습니다.

```text
cancel 요청
    │
    ▼
interrupt 신호
    │
    ├─ task가 확인/대기 API가 반응 -> 정리 후 종료 가능
    └─ task가 무시             -> 계속 실행될 수 있음
```

그래서 backend의 background task나 executor 작업을 설계할 때는 timeout, interrupt 처리, resource cleanup을 함께 생각해야 합니다.

### 문제를 풀 때 확인할 것

1. `run()`을 직접 호출했는지 `start()`했는지 확인합니다.
2. 현재 thread가 어떤 상태에서 기다리는지 봅니다.
3. interrupt가 상태 플래그인지 `InterruptedException`으로 나타나는지 확인합니다.
4. catch 이후 interrupt 신호가 보존되는지 추적합니다.
5. `join()` 이후 어떤 작업이 완료됐다고 보장할 수 있는지 봅니다.

### 자주 헷갈리는 부분

- `interrupt()`는 thread를 강제로 즉시 종료하지 않습니다.
- `run()`을 직접 호출하면 새로운 thread가 생기지 않습니다.
- `RUNNABLE`이 반드시 현재 CPU에서 실행 중이라는 뜻은 아닙니다.
- `InterruptedException`을 잡고 아무 처리 없이 넘기면 상위 취소 정책이 신호를 잃을 수 있습니다.

### 면접에서 설명한다면

Java thread는 생성 후 `start()`로 실행을 시작하고 종료될 때까지 여러 대기 상태를 거칠 수 있습니다. `interrupt()`는 강제 종료 명령이 아니라 cooperative cancellation을 위한 신호이며, 작업은 interrupt 상태를 확인하거나 `InterruptedException`에 반응해 스스로 정리하고 끝나야 합니다. `join()`은 다른 thread의 종료를 기다리는 API이며 memory visibility 측면에서도 의미 있는 동기화 지점입니다.
