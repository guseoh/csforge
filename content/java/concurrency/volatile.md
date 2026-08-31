---
kind: concept
contentKey: java.core.concurrency.volatile
topicContentKey: java.core.concurrency
slug: volatile
title: "volatile"
summary: "volatile read/write가 제공하는 visibility·ordering과 단순 read/write atomicity를 이해하고 count++ 같은 compound operation을 atomic하게 만들지 못함을 설명한다"
level: 3
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.3.1.4"
    title: "Java SE 25 JLS: volatile Fields"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: volatile field declaration 의미 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5"
    title: "Java SE 25 JLS: Happens-before Order"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: volatile write/read happens-before 확인
---
# volatile

## 쉬운 진입

한 thread가 종료 신호를 쓰고 다른 thread가 그것을 감시하는 경우, reader가 최신 신호를
관찰할 수 있어야 한다. volatile field는 그 field에 대한 write와 이후 read 사이의
visibility와 ordering 계약을 제공한다.

## 정확한 메커니즘

~~~
class Worker {
    private volatile boolean stop;

    void requestStop() {
        stop = true;
    }

    void run() {
        while (!stop) {
            doSmallUnit();
        }
    }
}
~~~

volatile write는 같은 volatile field의 이후 read와 happens-before 관계를 만든다. 그래서
stop처럼 독립적인 상태 플래그에는 적합하다. 하지만 count++는 read, add, write의
compound action이다. 두 thread가 같은 값을 읽고 각각 쓰면 lost update가 생길 수 있다.
이 경우 synchronized, Lock, AtomicInteger의 incrementAndGet처럼 invariant에 맞는
원자적 도구를 선택한다.

volatile은 Java language/JMM 계약이고, “CPU cache를 끄는 키워드”나 특정 machine
instruction이라는 표현은 구현 설명일 뿐이다. volatile field를 읽는다고 다른 일반
field의 임의 변경까지 모든 상황에서 atomic하게 묶이는 것도 아니다. publication에
사용할 때는 publish 전에 쓴 객체 상태와 reader의 read 사이 edge가 의도한 범위를
덮는지 확인한다.

## 흔한 오해

- volatile이 mutual exclusion을 제공하지 않는다.
- volatile count++는 원자적 증가가 아니다.
- volatile이 모든 object graph를 불변으로 만들지 않는다.
