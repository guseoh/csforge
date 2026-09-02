---
kind: concept
contentKey: java.core.concurrency.synchronized-monitor
topicContentKey: java.core.concurrency
slug: synchronized-monitor
title: "Synchronized and monitor"
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
# synchronized와 intrinsic monitor

여러 thread가 같은 재고 값을 수정할 때 "한 번에 한 thread만 확인과 차감을 수행하게 하자"고 결정했다면 Java에서는 `synchronized`를 사용할 수 있습니다. 하지만 `synchronized`라는 단어를 붙였다는 사실보다 **모든 경쟁 thread가 같은 monitor를 기준으로 보호받고 있는가**가 더 중요합니다.

### Java 객체에는 synchronization에 사용할 monitor가 연결된다

```java
synchronized (lock) {
    // critical section
}
```

현재 thread가 `lock` 객체의 monitor를 획득해야 block 안으로 들어갈 수 있습니다. 다른 thread가 같은 monitor를 이미 소유하고 있으면 진입을 기다립니다.

```text
             same monitor
                 │
Thread A -> [ 획득 ] -> critical section -> [ 해제 ]
Thread B -> [             대기             ] -> 진입
```

이것이 상호 배제(mutual exclusion)의 기본 모습입니다.

### instance synchronized method는 `this`를 기준으로 한다

```java
class Counter {
    private int value;

    synchronized void increment() {
        value++;
    }
}
```

이 메서드는 해당 `Counter` instance의 monitor를 사용합니다. 따라서 서로 다른 Counter 객체라면 서로 다른 monitor입니다.

```java
Counter a = new Counter();
Counter b = new Counter();
```

A thread가 `a.increment()`를 실행한다고 `b.increment()`까지 같은 lock 때문에 막히는 것은 아닙니다.

### static synchronized는 Class 객체를 기준으로 한다

```java
static synchronized void updateGlobal() {
    // ...
}
```

static method에는 특정 instance의 `this`가 없으므로 해당 class를 나타내는 `Class` 객체의 monitor를 사용합니다.

따라서 instance synchronized와 static synchronized를 "둘 다 synchronized니까 같은 lock"이라고 생각하면 안 됩니다.

### 서로 다른 lock을 잡으면 보호가 되지 않는다

```java
void increment() {
    synchronized (new Object()) {
        value++;
    }
}
```

호출할 때마다 새 Object를 만든다면 각 thread가 다른 monitor를 얻을 수 있으므로 서로를 막지 못합니다.

```text
Thread A -> lock A -> value++
Thread B -> lock B -> value++

lock이 다르므로 mutual exclusion 성립 안 함
```

Lock object의 identity와 lifetime이 중요합니다.

### synchronized는 재진입이 가능하다

같은 thread가 이미 가진 monitor를 다시 획득할 수 있습니다. 이를 **reentrant**라고 합니다.

```java
synchronized void first() {
    second();
}

synchronized void second() {
    // 같은 this monitor 사용
}
```

`first()`를 실행하는 thread는 이미 `this` monitor를 소유하고 있지만 `second()`에 다시 들어갈 수 있습니다.

재진입은 같은 thread에 대한 성질입니다. 다른 thread도 동시에 들어갈 수 있다는 뜻은 아닙니다.

### lock은 코드 줄보다 invariant 범위에 맞춘다

```java
synchronized (lock) {
    if (stock <= 0) {
        throw new SoldOutException();
    }
    stock--;
}
```

재고 확인만 lock 안에 넣고 실제 차감은 밖에 둔다면 race가 남을 수 있습니다. 반대로 unrelated I/O까지 같은 lock 안에 오래 두면 다른 thread가 불필요하게 기다릴 수 있습니다.

따라서 critical section은 **공유 상태의 올바름을 지키는 데 필요한 최소한의 논리적 범위**로 설계합니다. "짧을수록 무조건 좋다"보다 invariant를 먼저 보아야 합니다.

### synchronized는 memory visibility에도 의미가 있다

Java Memory Model에서 **한 monitor의 unlock은 synchronization order상 그 뒤에 오는 같은 monitor의 모든 lock보다 happens-before**합니다.

```text
Thread A
shared.value = 10
unlock M
     │
     │ happens-before
     ▼
lock M
read shared.value
Thread B
```

같은 thread 안의 program order와 이 unlock→lock edge를 transitivity로 연결하면, unlock 전에 수행한 write를 이후 같은 monitor를 획득한 thread의 read까지 연결해 추론할 수 있습니다. 따라서 synchronized는 단순히 "동시에 못 들어오게 하는 mutex" 역할뿐 아니라 적절한 monitor 경계를 통한 memory visibility/order도 제공합니다.

이것은 Java 언어/JMM 수준의 보장입니다. HotSpot이 내부적으로 어떤 lock representation을 사용하고 OS primitive를 어떻게 쓰는지는 구현 세부입니다.

### 문제를 풀 때 확인할 것

1. 각 synchronized 구문의 monitor 객체가 무엇인지 적습니다.
2. 경쟁하는 모든 코드 경로가 같은 monitor를 사용하는지 확인합니다.
3. instance와 static synchronized를 구분합니다.
4. critical section이 실제 invariant 전체를 포함하는지 봅니다.
5. nested synchronized에서는 lock 획득 순서까지 확인합니다.

### 자주 헷갈리는 부분

- `synchronized`가 붙은 서로 다른 객체의 instance method가 모두 하나의 lock을 공유하는 것은 아닙니다.
- reentrant라는 말은 다른 thread도 함께 들어간다는 뜻이 아닙니다.
- synchronized가 객체 안의 모든 필드를 자동으로 보호하지 않습니다. 같은 monitor 규칙을 지키는 코드만 협력합니다.
- Java의 monitor 계약과 HotSpot 내부 lock 구현은 구분해야 합니다.

### 면접에서 설명한다면

`synchronized`는 특정 객체의 intrinsic monitor를 기준으로 한 상호 배제와 memory synchronization을 제공합니다. Instance synchronized method는 `this`, static synchronized method는 해당 `Class` 객체를 monitor로 사용합니다. 중요한 것은 경쟁하는 코드가 같은 monitor를 사용하고 실제 invariant 전체를 critical section 안에서 보호하는지이며, 한 monitor의 unlock은 이후 같은 monitor의 lock보다 happens-before합니다.
