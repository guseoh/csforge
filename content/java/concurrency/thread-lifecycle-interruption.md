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
    relationNote: start, run, join, interrupt, sleep와 Thread.State 계약 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5"
    title: "Java SE 25 JLS: Happens-before Order"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Thread.start와 thread termination/join의 happens-before 관계 확인
---
# Thread lifecycle과 interruption

`new Thread(...)`로 객체를 만들었다고 새 실행 흐름이 이미 시작된 것은 아닙니다. Thread는 생성되고, `start()`를 통해 실행하도록 schedule되며, `run()` 작업이 끝나면 종료됩니다. 중간에는 monitor, 다른 thread의 종료, sleep, I/O 등을 기다릴 수 있습니다.

이 흐름을 알아야 `run()`과 `start()`의 차이, `interrupt()`의 실제 효과를 정확히 설명할 수 있습니다.

### `start()`는 새 thread의 실행을 schedule한다

```java
Thread worker = new Thread(() -> doWork());
worker.start();
```

`start()`는 해당 Thread를 실행하도록 schedule하고 새로 시작된 thread가 `run()`을 수행하게 합니다. 이미 시작한 Thread는 종료된 뒤에도 다시 `start()`할 수 없습니다.

```text
caller
  │
  └─ worker.start()
         │
         └─ worker Thread가 run() 실행
```

### `run()` 직접 호출은 platform thread와 virtual thread를 구분해야 한다

입문 설명에서는 흔히 다음처럼 말합니다.

> `run()`을 직접 호출하면 새 thread가 시작되지 않고 현재 thread에서 일반 메서드처럼 실행된다.

이 설명은 `new Thread(runnable)`처럼 **Runnable task로 만든 platform Thread의 기본 구현**에는 맞습니다.

```java
Thread platform = new Thread(() -> doWork());
platform.run(); // 새 thread를 시작하지 않고 caller thread에서 task 실행
```

하지만 Java 25 `Thread` API는 virtual thread에 대해 다른 계약을 명시합니다.

```java
Thread virtual = Thread.ofVirtual().unstarted(() -> doWork());
virtual.run(); // Java 25 API: 직접 호출하면 아무 동작도 하지 않음
```

따라서 다음처럼 기억하는 편이 정확합니다.

```text
start()
  -> 해당 Thread를 실제로 시작하는 API

platform Thread의 run() 직접 호출
  -> 새 thread가 아니라 caller에서 Runnable 실행 가능

virtual Thread의 run() 직접 호출
  -> 직접 호출은 아무 동작도 하지 않음
```

`run()` 구현 세부를 이용해 thread를 시작하려 하지 말고 실행이 필요하면 `start()`를 사용합니다.

### Thread.State는 Java가 제공하는 관찰 모델이다

대표 상태는 다음과 같습니다.

- `NEW`: 아직 시작되지 않음
- `RUNNABLE`: JVM에서 실행 가능한 상태
- `BLOCKED`: monitor lock 진입을 기다림
- `WAITING`: 시간 제한 없이 특정 조건을 기다림
- `TIMED_WAITING`: 시간 제한을 두고 기다림
- `TERMINATED`: 실행 종료

이 상태 이름은 OS scheduler의 내부 상태와 1:1 대응하지 않습니다. `RUNNABLE`도 "바로 지금 CPU core에서 instruction을 실행 중"이라는 뜻만은 아닙니다.

### `join()`은 종료 대기이면서 memory-ordering edge다

```java
worker.start();
worker.join();
System.out.println("worker 완료 이후 실행");
```

`join()`이 정상 반환하면 caller는 worker가 종료됐다는 사실을 관찰합니다.

JMM에서는 thread가 수행한 모든 action이 **다른 thread가 그 thread의 종료를 감지한 이후 action보다 happens-before**합니다. `Thread.join()`의 성공적 반환은 그런 종료 감지 방식 중 하나입니다.

또한 `start()`를 호출하기 전 caller의 action은 시작된 thread의 action보다 happens-before합니다.

```text
caller write
   │
   ├─ start() ─────▶ worker actions
   │                    │
   │                    └─ termination
   │                         │
   └─────────────────────────┴─▶ successful join 이후 caller actions
```

이 관계를 `join()`이 변수를 volatile로 바꾼다고 설명하면 안 됩니다. 별도의 happens-before edge가 있는 것입니다.

### `interrupt()`는 강제 종료가 아니라 상태와 blocking operation에 작용한다

```java
worker.interrupt();
```

`interrupt()`가 대상 thread를 임의의 instruction 위치에서 강제로 죽이지는 않습니다. Java 25 API는 대상 thread가 현재 무엇을 하고 있는지에 따라 효과를 구체적으로 정의합니다.

#### wait / join / sleep에서 대기 중이면

대상 thread가 `Object.wait`, `Thread.join`, `Thread.sleep` 계열에서 blocking 중이면:

1. interrupted status가 clear되고
2. `InterruptedException`을 받습니다.

```text
interrupt()
   │
   ▼
wait/join/sleep
   ├─ status clear
   └─ InterruptedException
```

따라서 "InterruptedException이 발생할 때 flag가 지워질 수도 있다" 정도가 아니라, 이 API들의 계약에서는 **예외가 던져질 때 interrupted status가 clear됩니다.**

#### InterruptibleChannel에서 blocking I/O 중이면

`InterruptibleChannel`의 blocking I/O에서 interrupt되면 channel이 close되고, thread의 interrupt status는 set된 상태로 `ClosedByInterruptException`을 받습니다.

#### Selector에서 기다리는 중이면

Selection operation은 조기에 반환하고 interrupt status는 set됩니다.

#### 그 밖의 일반 실행 상태라면

앞 조건에 해당하지 않으면 thread의 interrupted status가 set됩니다. 코드가 interruptible API를 호출하지 않는다면 다음처럼 직접 polling해서 반응할 수 있습니다.

```java
while (!Thread.currentThread().isInterrupted()) {
    doSmallUnit();
}
```

즉 interrupt는 "언제나 InterruptedException"도 아니고 "단순 boolean flag 하나만 설정"하는 API도 아닙니다. **현재 blocking operation에 따라 protocol이 달라지는 cooperative cancellation mechanism**입니다.

### InterruptedException을 잡은 계층이 취소 정책을 결정한다

```java
try {
    Thread.sleep(1_000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    return;
}
```

`sleep`, `join`, `wait`에서 `InterruptedException`이 던져졌다면 status는 이미 clear된 상태입니다.

현재 메서드가 exception을 상위로 그대로 전달할 수 있다면 그렇게 전달할 수 있습니다. Checked exception을 그대로 전달하지 않고 상위 계층도 interrupt 사실을 알아야 한다면 `Thread.currentThread().interrupt()`로 status를 복원하고 종료/전파하는 패턴을 사용할 수 있습니다.

반대로 현재 계층이 취소를 최종 처리하고 즉시 종료한다면 항상 복원해야 하는 것은 아닙니다. 중요한 것은 **interrupt를 catch한 뒤 무시해서 호출자와 framework의 cancellation policy를 우연히 잃어버리지 않는 것**입니다.

### `Thread.interrupted()`와 `isInterrupted()`는 상태 clear 여부가 다르다

```java
Thread.interrupted();                  // current thread 검사 + clear
Thread.currentThread().isInterrupted(); // 검사만, 상태 유지
```

Java 25 API는 static `Thread.interrupted()`가 current thread의 interrupted status를 검사한 뒤 clear한다고 명시합니다. 반면 `isInterrupted()`는 상태를 바꾸지 않습니다.

Cancellation loop에서 어떤 API를 썼는지 추적하지 않으면 첫 검사에서 signal을 소비해 버릴 수 있습니다.

### Future cancel도 task의 협력이 필요하다

`Future.cancel(true)`처럼 실행 중인 task의 thread에 interrupt를 요청하는 API가 있어도 task가 interrupt를 무시하거나 현재 operation이 즉시 interrupt에 반응하지 않는다면 작업 종료가 즉각 보장되는 것은 아닙니다.

```text
cancel(true)
    │
    └─ interrupt 요청
          │
          ├─ interruptible operation / polling -> 정리 후 종료 가능
          └─ 신호를 무시하거나 반응하지 않음 -> 계속 실행 가능
```

Backend의 background task나 executor 작업을 설계할 때는 timeout, interrupt propagation, resource cleanup을 함께 생각해야 합니다.

### 문제를 풀 때 확인할 것

1. `start()`했는지 `run()`을 직접 호출했는지 확인합니다.
2. direct `run()`이면 platform Thread인지 virtual Thread인지 구분합니다.
3. 현재 thread가 wait/join/sleep, InterruptibleChannel, Selector, 일반 실행 중 어디에 있는지 봅니다.
4. interrupt 이후 status가 set되는지 clear되는지 추적합니다.
5. catch 이후 signal을 상위 정책에 전달해야 하는지 결정합니다.
6. `Thread.interrupted()`가 status를 clear한다는 점을 확인합니다.
7. successful join의 memory-ordering 의미를 봅니다.

### 자주 헷갈리는 부분

- `interrupt()`는 thread를 강제로 즉시 종료하지 않습니다.
- platform Thread와 virtual Thread의 direct `run()` 계약은 같지 않습니다.
- wait/join/sleep에서 `InterruptedException`이 던져지면 interrupted status는 clear됩니다.
- InterruptibleChannel은 interrupt 시 channel close와 `ClosedByInterruptException`이라는 별도 동작을 가집니다.
- `Thread.interrupted()`는 조회하면서 current thread의 status를 clear합니다.
- `RUNNABLE`이 반드시 현재 CPU에서 실행 중이라는 뜻은 아닙니다.
- `join()`은 단순 wait뿐 아니라 JMM의 thread termination happens-before 관계와 연결됩니다.

### 면접에서 설명한다면

Java thread는 `start()`로 실행을 시작하며, `run()`을 직접 호출하는 것과는 다릅니다. 특히 Java 25에서는 Runnable을 가진 platform Thread의 direct `run()`은 caller에서 task를 실행할 수 있지만 virtual Thread의 `run()`을 직접 호출하면 아무 동작도 하지 않습니다. `interrupt()`는 강제 kill이 아니라 cooperative cancellation mechanism이고, wait/join/sleep에서는 status를 clear한 뒤 `InterruptedException`, InterruptibleChannel에서는 channel close와 `ClosedByInterruptException`, 일반 실행에서는 interrupt status set처럼 현재 상태에 따라 효과가 다릅니다. Successful `join()`은 종료 대기뿐 아니라 happens-before 관점에서도 의미가 있습니다.
