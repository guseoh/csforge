---
kind: concept
contentKey: java.core.concurrency.jmm-happens-before-visibility
topicContentKey: java.core.concurrency
slug: jmm-happens-before-visibility
title: "JMM happens-before and visibility"
summary: "CPU cache folklore가 아니라 Java Memory Model의 happens-before 관계를 통해 visibility와 ordering을 설명한다"
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5"
    title: "Java SE 25 JLS: Happens-before Order"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: happens-before와 synchronization order 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/package-summary.html"
    title: "Java SE 25 API: java.util.concurrent"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: concurrent API의 memory consistency effects 확인
---
# JMM의 happens-before와 visibility

## 쉬운 진입

한 thread가 쓴 값을 다른 thread가 언제 안전하게 읽을 수 있는지는 “CPU cache를
flush했다”라는 단순한 설명으로 결정되지 않는다. Java Memory Model(JMM)은 한 action이
다른 action보다 먼저 일어나야 한다는 happens-before 관계로 허용되는 관찰을 정의한다.

## 정확한 메커니즘

~~~
class ReadyData {
    int data;
    boolean ready;

    void publish() {
        data = 42;
        ready = true;
    }
}
~~~

한 thread의 program order는 앞 action에서 뒤 action으로 happens-before를 만든다. 여기에
monitor unlock→같은 monitor의 이후 lock, volatile write→같은 field의 이후 read,
Thread.start()→새 thread action, 종료한 thread의 action→다른 thread의 성공적인 join이
추가된다. happens-before는 transitive이므로 publish thread의 data write가 monitor를
통해 reader의 이후 read에 연결될 수 있다.

반대로 ready를 일반 field로 두고 아무 synchronization 없이 읽으면 reader가 data의
최신값을 반드시 관찰한다고 결론내릴 수 없다. JMM의 visibility와 ordering은 보장 관계의
문제이며, 실제 CPU cache나 memory barrier의 구체적 구현은 JDK/CPU 영역이다.

## 실전·면접 연결

먼저 필요한 happens-before edge를 그림으로 그리고, 그 edge가 모든 관련 state를
연결하는지 확인한다. volatile 하나가 edge를 만들더라도 복합 invariant의 atomicity나
상호 배제를 제공하는 것은 아니다.

## 흔한 오해

- “다른 thread가 언젠가 보겠지”는 JMM 보장이 아니다.
- volatile은 monitor처럼 mutual exclusion lock을 만들지 않는다.
- happens-before가 source line의 절대 실행 시각을 뜻하지 않는다.
