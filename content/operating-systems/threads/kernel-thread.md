---
kind: concept
contentKey: operating-systems.core.threads.kernel-thread
topicContentKey: operating-systems.core.threads
slug: kernel-thread
title: "Kernel Thread"
summary: "kernel scheduler가 직접 인식하는 실행 단위와 blocking·parallelism의 관계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man2/clone.2.html"
    title: "clone(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux에서 실행 task가 address space·file table 등 자원을 공유하도록 구성하는 방식을 확인한다."
    displayOrder: 1
  - url: "https://openjdk.org/jeps/444"
    title: "JEP 444: Virtual Threads"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "현재 JDK의 platform thread가 OS thread의 thin wrapper로 구현되고 virtual thread와 어떻게 구분되는지 확인한다."
    displayOrder: 2
---
# Kernel Thread

### 여기서 말하는 kernel thread의 범위

이 Concept에서 **kernel thread 또는 kernel-level thread**라는 표현은 교과서적 threading model에서 **kernel scheduler가 직접 인식하고 scheduling할 수 있는 thread**를 뜻한다. 이것을 Linux kernel 내부 작업을 수행하는 전용 `kthread`와 같은 의미로 한정해서 읽으면 안 된다. Application process 안에서 user code를 실행하는 thread도 kernel이 독립적인 scheduling 대상으로 관리할 수 있다.

### kernel이 scheduling 가능한 실행 단위를 본다는 의미

kernel-visible thread는 OS scheduler가 독립적인 runnable/blocking execution context로 추적할 수 있는 실행 단위다. kernel은 각 thread의 CPU context와 scheduling state를 관리하므로 같은 process의 T1이 I/O를 기다려 sleeping 상태가 되어도 T2가 runnable이라면 같은 CPU의 다른 실행 구간이나 다른 CPU에서 계속 실행될 수 있다.

**Linux에서는** 전통적인 `process`와 `thread`를 완전히 별개의 구현 객체로만 나누기보다 task가 어떤 자원을 공유할지 `clone` 계열 semantics로 구성한다. 그래서 thread를 이해할 때 `주소 공간을 공유하는가`, `file table을 공유하는가`, `scheduler가 별도 task로 보는가` 같은 축을 분리해서 보는 편이 정확하다.

### scheduler가 안다는 것은 비용도 관리한다는 뜻이다

kernel이 thread를 별도로 scheduling하려면 각 thread의 execution context와 scheduling metadata를 유지하고 runnable queue에서 선택해야 한다. thread가 많아지면 동시에 실행 가능한 CPU 수 이상으로 runnable task가 늘어 scheduling 경쟁과 context switch가 증가할 수 있다.

따라서 kernel-visible thread는 parallelism을 가능하게 하는 실행 단위이지 `thread 수만 늘리면 throughput이 늘어나는 장치`가 아니다. CPU-bound workload에서는 CPU core 수, I/O-bound workload에서는 blocking 시간과 downstream capacity가 실제 상한을 만든다.

### Java platform thread와 연결

**현재 JDK 구현에서** Java platform thread는 전통적인 방식으로 OS thread를 얇게 감싼 `java.lang.Thread`다. 그래서 platform thread의 실제 CPU 실행은 OS scheduler가 담당하고, 하나가 blocking되어도 다른 OS-schedulable thread는 별도로 실행될 수 있다.

여기서도 Java 언어가 모든 구현에 대해 영원히 `Java thread = OS thread`를 보장한다고 일반화하면 안 된다. Java virtual thread처럼 JDK가 많은 Java thread를 더 적은 수의 platform/OS thread 위에 scheduling하는 별도 실행 모델도 있기 때문이다. 이 경계는 `Java Virtual Thread Boundary` Concept에서 따로 다룬다.
