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
---
# Kernel Thread

### kernel이 scheduling 가능한 실행 단위를 본다는 의미

kernel-visible thread는 OS scheduler가 독립적인 runnable/blocking execution context로 추적할 수 있는 실행 단위다. kernel은 각 thread의 CPU context와 scheduling state를 관리하므로 같은 process의 T1이 I/O를 기다려 sleeping 상태가 되어도 T2가 runnable이라면 다른 CPU에서 계속 실행될 수 있다.

Linux는 전통적인 `process`와 `thread`를 완전히 별개의 구현 객체로만 나누기보다 task가 어떤 자원을 공유할지 `clone` 계열 semantics로 구성한다. 그래서 thread를 이해할 때 `주소 공간을 공유하는가`, `file table을 공유하는가`, `scheduler가 별도 task로 보는가` 같은 축을 분리해서 보는 편이 정확하다.

### scheduler가 안다는 것은 비용도 관리한다는 뜻이다

kernel이 thread를 별도로 scheduling하려면 각 thread의 stack/context와 scheduling metadata를 유지하고 runnable queue에서 선택해야 한다. thread가 많아지면 동시에 실행 가능한 CPU 수 이상으로 runnable task가 늘어 context switch와 cache 경쟁이 증가할 수 있다.

따라서 kernel thread는 parallelism을 가능하게 하는 실행 단위이지 `thread 수만 늘리면 throughput이 늘어나는 장치`가 아니다. CPU-bound workload에서는 CPU core 수, I/O-bound workload에서는 blocking 시간과 downstream capacity가 실제 상한을 만든다.

### platform thread와 연결

일반적인 Java platform thread는 OS scheduling 대상과 밀접하게 대응한다. 하나가 blocking syscall에서 잠들면 다른 platform thread는 계속 실행할 수 있지만, 너무 많은 platform thread를 만들면 native stack과 scheduler 비용이 커진다. 이 비용이 thread pool이나 virtual thread 같은 더 높은 수준의 실행 모델이 등장한 배경 중 하나다.
