---
kind: concept
contentKey: java.core.concurrency.synchronized-monitor
topicContentKey: java.core.concurrency
slug: synchronized-monitor
title: "Synchronized and monitor"
summary: "synchronized를 사용한 mutual exclusion, intrinsic monitor ownership과 reentrancy를 이해하고 어떤 critical section을 보호하는지 설명한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.19"
    title: "Java SE 25 JLS: The synchronized Statement"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: synchronized statement와 monitor lock 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: monitor와 happens-before 확인
---
# synchronized와 intrinsic monitor

## 쉬운 진입

synchronized는 한 번에 한 thread만 특정 monitor를 소유한 critical section에 들어가게
한다. instance synchronized method의 monitor는 해당 객체이고, static synchronized
method의 monitor는 그 class의 Class 객체다. 어떤 lock을 공유하는지부터 확인해야 보호가
실제로 성립한다.

## 정확한 메커니즘

~~~
class Counter {
    private int value;

    synchronized void increment() {
        value++;
    }

    int read() {
        synchronized (this) {
            return value;
        }
    }
}
~~~

monitor는 ownership을 갖고, 소유자가 아닌 thread는 진입을 기다린다. 같은 thread가
이미 소유한 monitor를 다시 획득하는 것은 reentrant이므로 synchronized method가 같은
객체의 다른 synchronized method를 호출할 수 있다. block을 빠져나오면 lock이 자동으로
해제되지만, 어떤 객체를 lock으로 사용할지는 코드가 안정적으로 공유해야 한다.

JLS 언어 보장은 mutual exclusion과 monitor unlock/lock에 따른 memory consistency다.
특정 HotSpot 내부 lock 구현이나 OS mutex의 모양을 Java 계약처럼 설명하지 않는다. 너무
넓은 lock은 경합을 키우고, 너무 좁은 lock은 invariant를 놓칠 수 있으므로 critical
section을 상태 규칙 단위로 정한다.

## 흔한 오해

- synchronized method는 모든 Counter instance 사이를 막지 않고 같은 monitor를 기준으로 막는다.
- reentrant라고 해서 다른 thread도 동시에 들어갈 수 있다는 뜻은 아니다.
- synchronized가 객체 내부의 모든 다른 상태 변경까지 자동으로 보호하지 않는다.
