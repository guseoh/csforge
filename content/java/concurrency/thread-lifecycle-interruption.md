---
kind: concept
contentKey: java.core.concurrency.thread-lifecycle-interruption
topicContentKey: java.core.concurrency
slug: thread-lifecycle-interruption
title: "Thread 생명주기와 중단"
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
    title: "The Java Language Specification — 17.4.5 Happens-before Order"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Thread.start와 thread termination/join이 만드는 happens-before 관계를 확인한다."
    displayOrder: 2
    relationNote: Thread.start와 thread termination/join의 happens-before 관계 확인
  - url: "https://d2.naver.com/helloworld/10963"
    title: "스레드 덤프 분석하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "thread 상태와 lock 대기를 실제 thread dump에서 읽는 방법을 확인한다."
    displayOrder: 3
    relationNote: thread 상태와 blocked/waiting 진단을 실제 장애 흐름으로 연결
---
# Thread 생명주기와 중단

`Thread` 객체를 만들었다고 새 실행 흐름이 이미 시작된 것은 아닙니다. Thread는 생성되고, `start()`를 통해 실행이 시작되며, `run()`이 끝나면 종료됩니다. 중간에는 monitor 획득, 다른 thread의 종료, sleep 같은 조건을 기다릴 수 있습니다.

이 흐름을 이해하면 `start()`와 `run()`의 차이, `join()`의 의미, `interrupt()`가 왜 강제 종료 API가 아닌지를 함께 설명할 수 있습니다.

### `start()`가 새 Thread의 실행을 시작한다

```java
Thread worker = new Thread(this::doWork);
worker.start();
```

`start()`는 해당 Thread가 독립적으로 실행되도록 schedule하고 그 Thread에서 `run()`이 수행되게 합니다. 한 Thread 객체는 한 번만 시작할 수 있으며 종료한 뒤 다시 `start()`할 수 없습니다.

```text
caller
  │
  └─ start()
       │
       ▼
worker thread -> run() -> terminate
```

`run()`은 Thread가 실행할 본문이지 Thread 시작 API가 아닙니다. Java 25 `Thread` 문서는 direct `run()` 호출을 의도된 사용으로 보지 않습니다. Runnable task로 만든 platform thread에서는 caller가 직접 `run()`하면 그 caller에서 task가 실행될 수 있고, virtual thread의 `run()`을 직접 호출하면 아무 동작도 하지 않습니다. 새 Thread 실행이 목적이라면 `start()`를 사용해야 합니다.

### Thread.State는 Java가 제공하는 관찰 모델이다

대표 상태는 다음과 같습니다.

- `NEW`: 아직 시작되지 않음
- `RUNNABLE`: JVM에서 실행 가능한 상태
- `BLOCKED`: monitor lock 획득을 기다림
- `WAITING`: 시간 제한 없이 특정 조건을 기다림
- `TIMED_WAITING`: 시간 제한을 두고 기다림
- `TERMINATED`: 실행 종료

이 상태는 OS scheduler 상태와 1:1로 대응하지 않습니다. `RUNNABLE`이라고 해서 반드시 바로 그 순간 CPU core에서 instruction을 실행 중이라는 뜻은 아닙니다.

### `join()`은 종료를 기다리고 memory ordering도 연결한다

```java
worker.start();
worker.join();
useResult();
```

`join()`이 성공적으로 반환하면 caller는 worker가 종료된 뒤 다음 코드로 진행합니다. JMM에서는 시작과 종료 관찰에 별도의 happens-before 관계를 정의합니다.

```text
caller의 start 이전 action
      │
      ├─ start() ─────▶ worker actions
      │                    │
      │                 terminate
      │                    │
      └──────────── successful join
                           │
                           ▼
                    caller의 후속 action
```

따라서 `join()`은 단순한 시간 대기 이상의 memory-ordering 의미를 가집니다.

### `interrupt()`는 강제 kill이 아니라 중단 요청이다

```java
worker.interrupt();
```

`interrupt()`는 대상 thread를 임의의 instruction 위치에서 즉시 종료하지 않습니다. 현재 thread가 무엇을 하고 있는지에 따라 interruption을 관찰하는 방식이 달라집니다.

`wait`, `join`, `sleep`에서 기다리는 thread가 interrupt되면 `InterruptedException`이 발생하고 interrupted status는 clear됩니다. 일반 실행 중이라면 interrupted status가 set되며 코드가 이를 확인해 협력적으로 종료할 수 있습니다.

```java
while (!Thread.currentThread().isInterrupted()) {
    doSmallUnit();
}
```

일부 interruptible I/O나 Selector는 또 각 API가 정의한 방식으로 interruption에 반응합니다. 따라서 `interrupt = 항상 예외` 또는 `interrupt = boolean flag만 변경`이라고 한 문장으로 일반화하면 안 됩니다.

### InterruptedException을 잡았다면 signal을 어떻게 처리할지 결정한다

```java
try {
    Thread.sleep(1_000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    return;
}
```

`sleep`, `wait`, `join`이 `InterruptedException`을 던질 때 interrupted status는 이미 clear됩니다. 현재 계층이 checked exception을 상위에 다시 던질 수 없다면 status를 복원해 상위 실행 정책이 interruption을 계속 인식하게 하는 패턴을 사용할 수 있습니다.

반대로 현재 계층이 cancellation을 최종 처리하고 종료한다면 기계적으로 항상 복원할 필요는 없습니다. 중요한 것은 **interruption을 catch한 뒤 아무 의미 없이 삼켜 cancellation signal을 잃지 않는 것**입니다.

### `Thread.interrupted()`와 `isInterrupted()`는 다르다

```java
Thread.interrupted();                    // current thread 조회 + clear
Thread.currentThread().isInterrupted();  // 조회만
```

Cancellation loop에서 어느 API를 사용하는지에 따라 signal을 소비하는 시점이 달라집니다.

Thread lifecycle을 읽을 때는 `start()`로 실제 실행이 시작됐는지, 현재 어떤 종류의 대기 상태인지, interruption을 어떤 API가 관찰하는지, 그리고 `join()` 이후에 어떤 memory-ordering 보장이 생기는지를 순서대로 추적하세요. Interrupt는 강제 종료가 아니라 **작업 코드와 blocking API가 협력해 처리하는 cancellation protocol**입니다.
