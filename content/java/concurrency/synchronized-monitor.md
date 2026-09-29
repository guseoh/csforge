---
kind: concept
contentKey: java.core.concurrency.synchronized-monitor
topicContentKey: java.core.concurrency
slug: synchronized-monitor
title: "synchronized와 모니터(Monitor)"
summary: "synchronized가 어떤 monitor를 기준으로 상호 배제와 memory visibility를 제공하는지 이해한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.19"
    title: "Java SE 25 JLS: The synchronized Statement"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: synchronized statement와 monitor lock의 언어 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: monitor lock과 happens-before memory consistency 확인
---
# synchronized와 모니터(Monitor)

여러 스레드가 같은 상태를 수정할 때 `synchronized`를 사용하면 특정 객체의 **모니터**를 기준으로 critical section에 한 번에 한 스레드만 진입하게 할 수 있습니다. 하지만 키워드를 붙였다는 사실보다 **경쟁하는 모든 코드가 실제로 같은 모니터를 사용하는가**가 더 중요합니다.

### synchronized block은 지정한 객체의 모니터를 잠근다

```java
synchronized (lock) {
    // critical section
}
```

Thread는 본문에 들어가기 전에 `lock` 객체의 모니터를 획득해야 합니다. 다른 스레드가 같은 모니터를 소유하고 있다면 획득할 때까지 기다립니다.

```text
             같은 모니터
                 │
스레드 A -> [ 잠금 ] -> 임계 영역 -> [ 잠금 해제 ]
스레드 B -> [              대기             ] -> 진입
```

JLS는 Java의 각 객체가 모니터와 연결되고 한 시점에 하나의 스레드만 그 모니터 lock을 소유한다고 정의합니다.

### 인스턴스와 static synchronized는 서로 다른 모니터를 사용할 수 있다

```java
class Counter {
    synchronized void increment() {
        // this monitor
    }

    static synchronized void resetAll() {
        // Counter.class monitor
    }
}
```

Instance synchronized 메서드는 호출 대상인 `this`의 모니터를 사용합니다. 서로 다른 인스턴스 `a`, `b`는 서로 다른 모니터를 가지므로 `a.increment()`와 `b.increment()`가 하나의 lock으로 직렬화되는 것은 아닙니다.

`static synchronized` 메서드는 해당 클래스를 나타내는 `Class` 객체의 모니터를 사용합니다. 따라서 인스턴스 `synchronized`와 정적 `synchronized`를 "같은 클래스에 있으니 같은 잠금"이라고 판단하면 안 됩니다.

### lock 동일성이 다르면 같은 상태를 보호하지 못한다

```java
void increment() {
    synchronized (new Object()) {
        value++;
    }
}
```

매 호출마다 새 lock 객체를 만든다면 서로 다른 스레드가 서로 다른 모니터를 획득할 수 있습니다. 둘 다 synchronized block 안에 있어도 `value++`에 대한 상호 배제(mutual exclusion)는 만들어지지 않습니다.

```text
스레드 A -> 모니터 A -> value++
스레드 B -> 모니터 B -> value++

monitor가 다르므로 서로 막지 않음
```

따라서 어떤 객체 동일성을 lock으로 사용할지와 그 lock의 수명이 동기화 설계의 일부입니다.

### critical section은 실제 불변 조건 전체를 포함해야 한다

```java
synchronized (lock) {
    if (stock <= 0) {
        throw new SoldOutException();
    }
    stock--;
}
```

재고 확인만 synchronized 안에 두고 차감을 밖으로 빼면 두 작업 사이에 다른 스레드가 끼어들 수 있습니다. 반대로 공유 상태와 무관한 느린 I/O까지 같은 lock 안에 두면 다른 스레드의 대기 시간을 불필요하게 늘릴 수 있습니다.

핵심은 "lock 범위를 최대한 짧게"가 아니라 **업무 불변 조건을 깨뜨릴 수 없는 최소한의 논리적 범위**를 보호하는 것입니다.

### synchronized는 가시성/순서에도 JMM 의미가 있다

한 모니터의 unlock은 동기화 순서상 그 뒤의 같은 모니터 lock과 synchronizes-with 관계를 만들고, 따라서 happens-before edge가 됩니다.

```text
스레드 A                         스레드 B
공유 상태 쓰기
      │
unlock M ───────────────────▶ lock M
                                │
                                ▼
                           공유 상태 읽기
```

같은 스레드의 프로그램 순서와 이 edge를 연결하면 unlock 전에 수행한 쓰기를 이후 같은 모니터를 획득한 스레드의 후속 읽기와 연결할 수 있습니다.

그래서 `synchronized`는 단순한 mutex 문법만이 아니라 **상호 배제(mutual exclusion)와 모니터 경계를 통한 메모리 동기화**를 함께 제공합니다. HotSpot이 이를 어떤 lock representation이나 OS 원시 타입으로 구현하는지는 JLS가 정하는 계약과 별개의 구현 문제입니다.

### 모니터는 재진입 가능하다

같은 스레드는 자신이 이미 소유한 모니터를 다시 lock할 수 있습니다.

```java
synchronized void first() {
    second();
}

synchronized void second() {
    // 같은 this monitor
}
```

이를 reentrant라고 합니다. 같은 스레드의 중첩 호출을 허용한다는 뜻이지 다른 스레드가 함께 critical section에 들어올 수 있다는 뜻은 아닙니다.

`synchronized` 코드를 읽을 때는 각 블록이나 메서드가 **정확히 어떤 모니터를 잠그는지**, 경쟁 경로가 모두 그 모니터를 통과하는지, 그리고 protected 불변 조건 전체가 critical section 안에 있는지를 먼저 확인하세요. 그 뒤에 대기 비용이나 lock 범위를 최적화해야 합니다.
