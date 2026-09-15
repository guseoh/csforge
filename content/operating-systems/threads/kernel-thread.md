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

이 Concept에서 kernel thread 또는 kernel-level thread는 **운영체제 scheduler가 직접 인식하고 scheduling하는 실행 단위**를 뜻한다. Linux 내부 전용 `kthread`만을 의미하는 표현으로 한정하지 않는다. User application의 thread도 kernel이 별도 task로 관리할 수 있다.

Kernel-visible thread마다 실행 context와 scheduling state가 있으므로 한 thread가 I/O를 기다려 sleep 상태가 되어도 같은 process의 다른 runnable thread는 계속 실행될 수 있다.

```text
Process
├─ Thread A → blocking I/O → waiting
└─ Thread B → runnable → scheduler가 CPU 배정 가능
```

### Kernel이 각각의 thread를 scheduling한다

Scheduler는 각 thread를 runnable/waiting 같은 상태로 추적하고 CPU를 배분한다. 여러 CPU가 있다면 서로 다른 kernel-visible thread를 실제로 동시에 실행할 수도 있다.

다만 thread 수를 늘린다고 CPU parallelism이 무한히 늘어나는 것은 아니다. 동시에 실행할 수 있는 계산의 수는 CPU core와 workload의 dependency/resource 조건에 제한된다. Runnable thread가 지나치게 많아지면 scheduler queue와 context-switch 비용이 증가할 수 있다.

### Linux의 process와 thread를 구현 객체 이름만으로 구분하지 않는다

Linux에서는 task가 어떤 resource를 공유할지를 `clone` 계열 semantics로 구성할 수 있다. 따라서 `process 객체`와 `thread 객체`가 완전히 다른 두 종류의 kernel object라고 외우기보다, **scheduler가 별도 실행 단위로 보는가와 address space·file table 같은 resource를 무엇과 공유하는가**를 구분해 이해하는 편이 정확하다.

현재 JDK의 platform thread는 OS thread와 밀접하게 대응하므로 OS scheduler가 실제 CPU 실행을 담당한다. Java virtual thread처럼 runtime이 더 많은 logical thread를 그 위에 multiplex하는 모델은 뒤에서 별도로 다룬다.