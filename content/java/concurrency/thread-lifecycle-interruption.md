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
    recommendation: "Java에서 conflicting access와 happens-before를 기준으로 data race를 정의하는 정확한 경계를 확인한다."
    displayOrder: 2
    relationNote: Thread.start와 thread termination/join의 happens-before 관계 확인
  - url: "https://d2.naver.com/helloworld/10963"
    title: "스레드 덤프 분석하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "JVM thread dump에서 lock owner와 waiter를 연결해 deadlock cycle을 해석하는 실제 사례를 확인한다."
    displayOrder: 3
    relationNote: "'스레드 덤프 유형별 패턴'의 monitor 소유자/대기자 분석 사례를 읽는다. 글의 RUNNABLE을 CPU 점유와 동일시하거나 OS 자원 분배가 Java WAITING으로 바꾼다는 설명은 Java 25 Thread.State 계약으로 받아들이지 않는다. 덤프 형식과 도구 사용법도 현행 공식 문서로 확인한다."
---
# Thread 생명주기와 중단

`Thread` 객체를 만들었다고 새 실행 흐름이 이미 시작된 것은 아닙니다. Thread는 생성되고, `start()`를 통해 실행이 시작되며, `run()`이 끝나면 종료됩니다. 중간에는 모니터 획득, 다른 스레드의 종료, sleep 같은 조건을 기다릴 수 있습니다.

이 흐름을 이해하면 `start()`와 `run()`의 차이, `join()`의 의미, `interrupt()`가 왜 강제 종료 API가 아닌지를 함께 설명할 수 있습니다.

### `start()`가 새 Thread의 실행을 시작한다

```java
Thread worker = new Thread(this::doWork);
worker.start();
```

`start()`는 해당 Thread가 독립적으로 실행되도록 schedule하고 그 Thread에서 `run()`이 수행되게 합니다. 한 Thread 객체는 한 번만 시작할 수 있으며 종료한 뒤 다시 `start()`할 수 없습니다.

```csforge-viz
{
  "version": 1,
  "type": "java-api-contract",
  "title": "Thread 시작·종료와 join",
  "description": "start 전, 실행 중, 종료를 확인한 join 반환을 비교합니다. 인터럽트는 협력적 신호이며 timed join의 timeout에는 종료 보장이 없습니다.",
  "example": "thread-lifecycle"
}
```

`run()`은 Thread가 실행할 본문이지 Thread 시작 API가 아닙니다. Java 25 `Thread` 문서는 direct `run()` 호출을 의도된 사용으로 보지 않습니다. Runnable 작업으로 만든 플랫폼 스레드에서는 호출자가 직접 `run()`하면 그 호출자에서 작업이 실행될 수 있고, 가상 스레드의 `run()`을 직접 호출하면 아무 동작도 하지 않습니다. 새 Thread 실행이 목적이라면 `start()`를 사용해야 합니다.

### Thread.State는 Java가 제공하는 관찰 모델이다

대표 상태는 다음과 같습니다.

- `NEW`: 아직 시작되지 않음
- `RUNNABLE`: JVM에서 실행 가능한 상태
- `BLOCKED`: 모니터 lock 획득을 기다림
- `WAITING`: 시간 제한 없이 특정 조건을 기다림
- `TIMED_WAITING`: 시간 제한을 두고 기다림
- `TERMINATED`: 실행 종료

이 상태는 운영체제 스케줄러가 관리하는 상태와 1:1로 대응하지 않습니다. `RUNNABLE`이라고 해서 반드시 바로 그 순간 CPU 코어에서 명령을 실행 중이라는 뜻은 아닙니다.

### `join()`은 종료를 기다리고 메모리 순서도 연결한다

```java
worker.start();
worker.join();
useResult();
```

위처럼 시간 제한 없는 `join()`이 정상 반환하면 작업자의 종료를 관찰한 뒤 다음 코드로 진행합니다. 시간 제한이 있는 `join(timeout)`은 제한 시간이 지나서 반환할 수도 있으므로 정상 반환만으로 종료를 단정하면 안 됩니다. 이 경우에는 `isAlive()` 등으로 종료 여부를 구분해야 합니다. JMM에서는 시작과 종료 관찰에 별도의 happens-before 관계를 정의합니다.

따라서 `join()`은 단순한 시간 대기 이상의 메모리-정렬 순서 의미를 가집니다.

### `interrupt()`는 강제 kill이 아니라 중단 요청이다

```java
worker.interrupt();
```

`interrupt()`는 대상 스레드를 임의의 명령 위치에서 즉시 종료하지 않습니다. 현재 스레드가 무엇을 하고 있는지에 따라 interruption을 관찰하는 방식이 달라집니다.

`wait`, `join`, `sleep`에서 기다리는 스레드가 interrupt되면 `InterruptedException`이 발생하고 인터럽트 상태는 해제됩니다. 일반 실행 중이라면 인터럽트 상태가 설정되며 코드가 이를 확인해 협력적으로 종료할 수 있습니다.

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

`sleep`, `wait`, `join`이 `InterruptedException`을 던질 때 interrupted status는 이미 clear됩니다. 현재 계층이 검사 예외를 상위에 다시 던질 수 없다면 status를 복원해 상위 실행 정책이 interruption을 계속 인식하게 하는 패턴을 사용할 수 있습니다.

반대로 현재 계층이 cancellation을 최종 처리하고 종료한다면 기계적으로 항상 복원할 필요는 없습니다. 중요한 것은 **interruption을 catch한 뒤 아무 의미 없이 삼켜 cancellation signal을 잃지 않는 것**입니다.

### `Thread.interrupted()`와 `isInterrupted()`는 다르다

```java
Thread.interrupted();                    // current thread 조회 + clear
Thread.currentThread().isInterrupted();  // 조회만
```

Cancellation loop에서 어느 API를 사용하는지에 따라 signal을 소비하는 시점이 달라집니다.

스레드 생명주기를 살펴볼 때는 `start()`로 실행이 시작됐는지, 현재 어떤 대기 상태인지, 어떤 API가 인터럽트를 확인하는지, `join()` 뒤에 어떤 메모리 순서 보장이 생기는지 차례로 추적하세요. 인터럽트는 강제 종료가 아니라 **작업 코드와 대기 API가 협력해 처리하는 취소 프로토콜**입니다.
