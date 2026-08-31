---
kind: concept
contentKey: java.core.concurrency.jmm-happens-before-visibility
topicContentKey: java.core.concurrency
slug: jmm-happens-before-visibility
title: "JMM happens-before and visibility"
summary: "여러 thread 사이에서 어떤 write를 안전하게 관찰할 수 있는지 Java Memory Model의 happens-before 관계로 추론한다"
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5"
    title: "Java SE 25 JLS: Happens-before Order"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: happens-before 정의와 synchronization edge 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/package-summary.html"
    title: "Java SE 25 API: java.util.concurrent"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Executor, Future, concurrent collection 등 고수준 API의 memory consistency effects 확인
---
# JMM의 happens-before와 visibility

한 thread가 `data = 42`를 실행한 다음 `ready = true`를 실행했다고 해 보겠습니다. 다른 thread가 `ready == true`를 봤다면 `data == 42`도 반드시 볼 수 있을까요?

직관적으로는 "먼저 42를 썼으니 당연하다"고 생각하기 쉽지만 여러 thread가 공유 메모리를 읽고 쓰는 Java 프로그램에서는 **어떤 동기화 관계가 있는지**를 확인해야 합니다. 이 규칙을 정의하는 것이 Java Memory Model(JMM)이고, 핵심 추론 도구 가운데 하나가 **happens-before**입니다.

### JMM은 CPU cache 이야기가 아니라 Java 프로그램의 관찰 규칙이다

동시성을 설명할 때 "각 CPU cache에 값이 남아 있어서 안 보인다"는 식의 그림을 자주 사용합니다. 하드웨어 이해에 도움은 될 수 있지만 그것만으로 Java의 보장을 설명할 수는 없습니다.

Java compiler, JIT, CPU는 언어가 허용하는 범위에서 여러 최적화를 할 수 있습니다. Java 개발자가 의존할 수 있는 것은 특정 CPU cache 구현이 아니라 **JLS가 정의한 memory model**입니다.

따라서 질문은 다음처럼 바꾸는 것이 좋습니다.

> Thread A의 write와 Thread B의 read 사이에 Java가 보장하는 happens-before 관계가 있는가?

### 같은 thread 안에서는 program order가 기본 관계를 만든다

```java
int data = 0;
boolean ready = false;

void publish() {
    data = 42;
    ready = true;
}
```

한 thread 안에서 program order상 앞선 action은 뒤의 action과 happens-before 관계를 형성합니다.

```text
Thread A

data = 42
   │
   ▼
ready = true
```

하지만 이것만으로 다른 thread까지 연결된 것은 아닙니다. Thread B로 넘어가는 **synchronization edge**가 필요합니다.

### monitor unlock과 이후 같은 monitor lock이 thread 사이를 연결한다

```java
synchronized (lock) {
    data = 42;
}
```

다른 thread가 이후 같은 `lock` monitor를 획득하면 이전 unlock과 이후 lock 사이에 happens-before 관계가 있습니다.

```text
Thread A                       Thread B

data = 42
   │
unlock(lock) ─────────────▶ lock(lock)
                               │
                               ▼
                           data 읽기
```

Transitivity까지 적용하면 `data = 42`도 Thread B의 이후 read와 연결할 수 있습니다.

### volatile write와 같은 field의 이후 read도 edge를 만든다

```java
class State {
    int data;
    volatile boolean ready;
}

void publish() {
    data = 42;
    ready = true;
}

void consume() {
    if (ready) {
        System.out.println(data);
    }
}
```

`ready = true`라는 volatile write는 같은 field의 이후 volatile read와 happens-before 관계를 만듭니다.

```text
Thread A                         Thread B

data = 42
   │
ready = true (volatile write)
   │
   └────────────────────────▶ read ready == true
                                │
                                ▼
                              read data
```

Program order + volatile edge + transitivity를 연결하면 publish 전에 쓴 `data`를 consume 쪽에서 안전하게 관찰하는 근거를 만들 수 있습니다.

### Thread.start와 join도 중요한 happens-before 관계다

```java
int value = 42;
Thread worker = new Thread(() -> use(value));
worker.start();
```

`start()`를 호출하기 전에 수행한 작업은 시작된 thread의 action과 memory consistency 관계를 가집니다.

반대 방향에서는 worker가 수행한 action들이 다른 thread가 성공적으로 `join()`한 이후 작업과 연결됩니다.

```text
caller writes
     │
Thread.start()
     │
     ▼
worker actions
     │
worker terminates
     │
Thread.join() returns
     │
     ▼
caller reads
```

### java.util.concurrent API도 더 높은 수준의 edge를 제공한다

공식 `java.util.concurrent` 문서는 다음과 같은 memory consistency 효과를 정의합니다.

- task를 Executor에 제출하기 전의 action → task 실행 시작 이후
- concurrent collection에 원소를 넣기 전의 action → 다른 thread가 그 원소에 접근/제거한 이후
- Future의 비동기 computation action → 다른 thread의 성공적인 `Future.get()` 이후
- `CountDownLatch.countDown()` 전 action → 해당 latch의 성공적인 `await()` 이후

그래서 모든 코드를 직접 volatile/monitor로 조립하지 않고 고수준 concurrency API의 계약을 이용할 수 있습니다.

### happens-before는 "벽시계상 무조건 먼저 실행됐다"는 뜻이 아니다

이 용어 때문에 가장 많이 생기는 오해입니다. Happens-before는 단순한 실제 시각 비교 이름이 아니라 **Java Memory Model이 허용되는 관찰과 ordering을 설명하기 위한 관계**입니다.

두 action 중 하나가 현실 시각상 먼저 실행됐더라도 필요한 happens-before 관계가 없으면 다른 thread가 그 write를 반드시 관찰한다고 결론내릴 수 없습니다.

반대로 JMM은 프로그램의 결과에 영향을 주지 않는 범위에서 compiler/JIT/CPU가 내부적으로 instruction을 재배치할 수도 있게 합니다. 개발자는 최종적으로 JMM 계약에 의존해야 합니다.

### happens-before가 있다고 복합 연산이 atomic한 것은 아니다

`volatile int count`가 있어도:

```java
count++;
```

은 여러 thread가 동시에 안전하게 증가시키는 atomic operation이 아닙니다. Happens-before/visibility와 read-modify-write의 atomicity는 별개 문제입니다.

```text
happens-before -> 어떤 write를 어떤 read가 안전하게 관찰하는가
atomicity      -> 여러 단계 사이에 다른 thread가 끼어들 수 있는가
```

### 문제를 풀 때 edge를 직접 그린다

동시성 문제에서는 다음 순서가 효과적입니다.

1. Thread A의 중요한 write를 표시합니다.
2. Thread B의 중요한 read를 표시합니다.
3. 같은 thread 안의 program order를 그립니다.
4. monitor/volatile/start/join/concurrent API가 만드는 cross-thread edge를 찾습니다.
5. transitivity로 write에서 read까지 경로가 이어지는지 확인합니다.

경로가 없다면 "어차피 먼저 실행될 것 같다"는 추측으로 visibility를 보장하면 안 됩니다.

### 면접에서 설명한다면

Happens-before는 Java Memory Model에서 한 thread의 action 결과를 다른 thread가 안전하게 관찰할 수 있는 ordering 관계를 추론하는 핵심 규칙이라고 설명할 수 있습니다. 같은 thread의 program order, monitor unlock→이후 lock, volatile write→이후 같은 volatile read, Thread.start/join 등이 대표적인 관계를 만들며 transitivity로 연결됩니다. 이는 특정 CPU cache를 flush한다는 구현 설명과 구분해야 하고, happens-before가 복합 연산의 atomicity까지 자동으로 보장하는 것도 아닙니다.
