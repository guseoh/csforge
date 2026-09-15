---
kind: concept
contentKey: operating-systems.core.threads.java-virtual-thread-boundary
topicContentKey: operating-systems.core.threads
slug: java-virtual-thread-boundary
title: "Java Virtual Thread Boundary"
summary: "Java 25 virtual thread와 carrier platform thread, blocking·pinning·downstream 경계를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
  - url: "https://openjdk.org/jeps/444"
    title: "JEP 444: Virtual Threads"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "현재 JDK의 platform thread가 OS thread의 thin wrapper로 구현되고 virtual thread와 어떻게 구분되는지 확인한다."
    displayOrder: 2
  - url: "https://openjdk.org/jeps/491"
    title: "JEP 491: Synchronize Virtual Threads without Pinning"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
---
# Java Virtual Thread Boundary

Java virtual thread는 OS thread를 대량으로 새로 만드는 기능이 아니다. Virtual thread는 JDK가 scheduling하는 lightweight `Thread`이며, CPU에서 실제로 실행될 때는 **carrier platform thread** 위에 mount된다. Platform thread는 OS thread와 대응하고, OS scheduler가 최종적으로 CPU 시간을 배분한다.

```text
virtual A ─┐
virtual B ─┼─ JDK scheduler → carrier platform threads → OS scheduler → CPU
virtual C ─┘
```

따라서 virtual thread가 매우 많아도 같은 순간 CPU에서 실행되는 계산량은 carrier와 CPU core 수의 제약을 받는다. Virtual thread의 주된 이점은 CPU-bound 계산을 자동으로 더 빠르게 만드는 것이 아니라 **blocking이 많은 task를 thread-per-task 스타일로 많이 다룰 때 platform thread 점유 비용을 줄이는 것**이다.

### Blocking할 때 carrier를 다른 virtual thread에 돌려줄 수 있다

Virtual thread가 JDK가 지원하는 blocking operation에서 기다리면 runtime은 virtual thread를 carrier에서 unmount하고 carrier를 다른 runnable virtual thread 실행에 사용할 수 있다. 완료 조건이 충족되면 virtual thread는 다시 scheduler에 제출되고 carrier에 mount되어 실행을 이어간다.

```text
virtual A running on carrier 1
        │ blocking
        ▼
virtual A unmount
carrier 1 → virtual B 실행
        │
A의 event 완료
        ▼
virtual A 다시 runnable → 어떤 carrier에서든 resume
```

Virtual thread와 특정 carrier 사이에 고정 affinity가 있는 것은 아니다.

### Pinning은 virtual thread와 carrier를 함께 묶는 경우다

Virtual thread가 unmount할 수 없는 상태에서 blocking하면 carrier도 함께 점유될 수 있다. Java 25 기준으로는 예전 설명을 그대로 사용하면 안 된다. JEP 491이 JDK 24에서 **일반적인 `synchronized` method/block 때문에 발생하던 monitor pinning을 제거**했기 때문이다.

따라서 `synchronized 안에서 blocking하면 virtual thread가 항상 carrier를 pin한다`는 설명은 Java 25 기준으로 부정확하다. Native method나 foreign function처럼 여전히 carrier와의 결합이 필요한 구간은 별도로 확인해야 한다.

### Virtual thread는 resource limit 자체를 없애지 않는다

Virtual thread를 많이 만들 수 있어도 CPU core, file descriptor, DB connection, remote service capacity 같은 자원이 늘어나는 것은 아니다. 실행 thread가 싸졌다고 해서 downstream work까지 무제한으로 병렬화할 수 있는 것은 아니다.

Java Virtual Thread Boundary의 핵심은 **virtual thread가 JDK scheduling 단위이고 carrier platform thread가 OS scheduling 단위라는 층을 구분하는 것**, 그리고 blocking 시 unmount할 수 있는 경우와 carrier를 함께 점유하는 경우를 구분하는 것이다.