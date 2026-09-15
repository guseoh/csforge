---
kind: concept
contentKey: java.core.concurrency.deadlock-starvation-livelock
topicContentKey: java.core.concurrency
slug: deadlock-starvation-livelock
title: "Deadlock·Starvation·Livelock 구분하기"
summary: "thread가 진행하지 못하는 원인을 deadlock·starvation·livelock으로 구분하고 대기 관계와 progress를 기준으로 진단한다"
level: 3
status: PUBLISHED
displayOrder: 190
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: lock·wait와 thread execution 모델 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/Lock.html"
    title: "Java SE 25 API: Lock"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: timed/interruptible lock acquisition 선택지 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.management/java/lang/management/ThreadMXBean.html"
    title: "Java SE 25 API: ThreadMXBean"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: platform thread monitoring과 deadlock detection 범위 확인
---
# Deadlock·Starvation·Livelock 구분하기

요청이 끝나지 않고 thread가 오래 살아 있다고 해서 모두 deadlock은 아닙니다. 동시성 문제를 진단할 때는 **thread가 무엇을 기다리는지와 시스템이 실제로 progress하고 있는지**를 봐야 합니다.

- **deadlock**: 서로가 가진 자원을 기다리며 대기 관계가 순환해 아무도 진행하지 못함
- **starvation**: 시스템 전체는 움직이지만 특정 thread나 작업이 계속 실행 기회를 얻지 못함
- **livelock**: thread들은 계속 반응하고 상태를 바꾸지만 유용한 작업이 완료되지 않음

### Deadlock은 자원 대기 관계가 cycle을 만든다

두 lock을 반대 순서로 획득한다고 해 보겠습니다.

```text
Thread A                    Thread B
lock X 획득                 lock Y 획득
    │                           │
lock Y 기다림                lock X 기다림
    │                           │
    └──────── 서로 대기 ────────┘
```

```java
// Thread A
synchronized (left) {
    synchronized (right) {
        transfer();
    }
}

// Thread B
synchronized (right) {
    synchronized (left) {
        transfer();
    }
}
```

실행 순서에 따라 A는 B가 가진 Y를, B는 A가 가진 X를 기다리며 아무도 lock을 놓을 수 없는 cycle이 생깁니다.

고전적으로 mutual exclusion, hold-and-wait, no preemption, circular wait 조건을 설명하지만 목적은 용어 암기보다 **어느 조건을 설계에서 끊을 수 있는지 찾는 것**입니다. 여러 lock을 항상 같은 순서로 획득하는 규칙은 circular wait를 피하는 대표적인 방법입니다.

```text
공통 규칙: X -> Y

Thread A: X -> Y
Thread B: X -> Y
```

### Timeout은 무한 대기를 피할 수 있지만 원인을 없애지는 않는다

`Lock.tryLock(timeout)`으로 일정 시간 뒤 포기할 수 있습니다. 이 방법은 무한 대기에서 빠져나오는 recovery 전략이 될 수 있지만, lock ordering이 잘못된 원인 자체가 사라진 것은 아닙니다.

또 timeout 후 일부 상태를 되돌려야 하는지, 다시 시도할지, 호출자에게 실패를 전달할지도 별도로 설계해야 합니다.

### Starvation은 일부 작업만 계속 밀리는 문제다

전체 시스템이 계속 요청을 처리해도 특정 작업은 필요한 자원을 거의 얻지 못할 수 있습니다.

```text
Task A: 실행 실행 실행 실행 ...
Task B: 대기 ───────────────── 계속 대기
```

가능한 원인은 하나가 아닙니다. 우선순위 높은 작업이 계속 들어오거나, 긴 작업이 작은 thread pool을 계속 점유하거나, lock 경쟁에서 특정 thread가 반복해서 기회를 잃을 수 있습니다.

Fair lock이나 queue 정책이 도움이 되는 경우도 있지만 **starvation의 원인이 scheduler인지, queue인지, 작업 시간인지, lock 경쟁인지**를 먼저 확인해야 합니다.

### Livelock은 움직이지만 앞으로 가지 못한다

두 작업이 충돌할 때마다 서로 양보하고 동시에 다시 시도한다고 해 보겠습니다.

```text
A: 충돌 -> 양보 -> 재시도
B: 충돌 -> 양보 -> 재시도
A: 충돌 -> 양보 -> 재시도
B: 충돌 -> 양보 -> 재시도
...
```

Thread는 `RUNNABLE`일 수도 있고 CPU도 사용하지만 완료 건수는 늘지 않습니다. 그래서 "thread가 blocked가 아니니 deadlock 계열 문제가 아니다"라고 판단하면 livelock을 놓칠 수 있습니다.

Randomized backoff나 retry 정책 변경이 도움이 될 수 있지만, 먼저 어떤 상호 반응이 무한한 재시도 feedback loop를 만드는지 찾아야 합니다.

### 느린 외부 I/O와 lock deadlock도 구분한다

```text
Thread A -> socket read에서 60초 대기
Thread B -> 정상 처리
```

이 현상 자체는 Java monitor deadlock이 아닙니다. DB connection pool 고갈, 외부 API timeout, 파일 I/O 같은 자원 대기도 thread를 오래 멈춰 보이게 할 수 있습니다.

따라서 hang을 볼 때는 thread state 이름보다 stack과 실제 대기 대상을 확인해야 합니다.

### 진단은 wait-for 관계와 시간에 따른 progress를 함께 본다

Thread dump에서는 어떤 lock을 기다리고 누가 소유하는지, 같은 대기 pattern이 여러 thread에 반복되는지를 확인할 수 있습니다.

```text
Thread A -> waits for X -> owned by B
Thread B -> waits for Y -> owned by A
```

이런 wait-for graph의 cycle은 deadlock을 설명하는 강한 증거입니다. 반면 starvation과 livelock은 한 번의 snapshot만으로 판단하기 어려울 수 있으므로 시간에 따른 CPU 사용량, queue 길이, 처리 완료 건수, 반복 stack pattern을 함께 봐야 합니다.

Java 25의 `ThreadMXBean` deadlock 탐지 API는 platform thread monitoring을 중심으로 하므로 모든 형태의 virtual-thread hang까지 하나의 탐지 결과로 일반화해서는 안 됩니다. 진단 도구가 **어떤 thread와 어떤 lock 종류를 관찰하는지**도 계약을 확인해야 합니다.

세 문제를 구분하는 기준은 간단합니다. Deadlock에서는 대기 관계가 cycle을 만들고 progress가 멈춥니다. Starvation에서는 다른 작업은 진행하지만 특정 작업이 기회를 얻지 못합니다. Livelock에서는 실행과 상태 변화는 계속되지만 유용한 결과가 나오지 않습니다. 이름부터 붙이기보다 **대기 관계와 실제 progress를 증거로 확인**하는 것이 먼저입니다.
