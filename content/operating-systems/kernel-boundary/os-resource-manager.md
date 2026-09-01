---
kind: concept
contentKey: operating-systems.core.kernel-boundary.os-resource-manager
topicContentKey: operating-systems.core.kernel-boundary
slug: os-resource-manager
title: "OS as Resource Manager"
summary: "운영체제가 CPU·memory·device를 추상화하고 보호·배분·회수하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "OS와 kernel service의 경계를 확인한다."
    displayOrder: 1
---
# OS as Resource Manager

여러 프로그램이 동시에 실행되면 CPU, memory, disk, network device 같은 실제 자원을 서로 나눠 써야 한다. 각 application이 hardware를 직접 제어하도록 두면 한 프로그램의 버그가 다른 프로그램의 memory를 덮어쓰거나 device 상태를 망가뜨릴 수 있고, CPU를 반환하지 않는 프로그램 때문에 다른 작업이 실행되지 못할 수도 있다.

운영체제 kernel은 이 문제를 해결하기 위해 hardware resource와 application 사이에 경계를 둔다. Application은 CPU core 자체나 physical memory 주소, disk controller를 마음대로 소유하지 않는다. 대신 process, virtual address space, file, socket 같은 **OS abstraction**을 통해 자원을 요청한다.

### 추상화와 자원 배분은 다른 역할이다

운영체제는 단순히 hardware API를 감싸는 library가 아니다. 예를 들어 process는 자신만의 CPU와 memory를 가진 것처럼 보이지만 실제로는 scheduler가 여러 runnable task에 CPU 시간을 나누고 MMU/page table과 kernel memory management가 virtual address를 physical memory에 연결한다.

```text
Application Process
   │
   ├─ CPU 실행 요청처럼 보임
   │      ↓
   │   Scheduler → 실제 CPU core/time slice
   │
   ├─ Virtual Address 사용
   │      ↓
   │   MMU + Page Table → Physical Memory
   │
   └─ File / Socket 사용
          ↓
       Kernel / Driver → Storage / NIC
```

이 과정에서 kernel은 세 가지 책임을 함께 가진다. **배분(allocation)**은 누가 얼마를 사용할지 정하고, **보호(protection)**는 다른 process의 자원을 함부로 침범하지 못하게 하며, **회수(reclamation)**는 process가 종료되거나 제한을 넘었을 때 자원을 다시 사용할 수 있게 만든다.

### 제한된 자원에는 경쟁이 생긴다

CPU core 수, physical memory, file descriptor, socket buffer는 무한하지 않다. 그래서 운영체제는 queue와 scheduling policy, memory reclaim, descriptor table 같은 구조를 관리한다. 어떤 process가 resource를 요청했다고 해서 항상 즉시 받을 수 있는 것은 아니다. CPU에서는 runnable 상태로 기다릴 수 있고, memory allocation은 실패할 수 있으며, file open은 descriptor limit에 걸릴 수 있다.

이 지점이 application 성능과 연결된다. Backend request가 느릴 때 Java code만 실행 중인 것이 아니라 scheduler에게 CPU를 기다리거나 page fault, disk/network I/O completion을 기다리는 시간이 포함될 수 있다.

### OS 자원과 application 자원을 같은 것으로 보지 않는다

Spring의 thread pool, JDBC connection pool, application queue는 **application이 만든 정책 단위**다. 반면 thread가 실행되는 CPU 시간, process address space, file descriptor와 socket은 OS 자원 위에 놓인다. Connection pool size를 100으로 설정했다고 해서 OS socket이나 DB connection이 무한히 생기는 것은 아니다.

따라서 Backend의 pool과 timeout을 설계할 때도 아래처럼 층을 구분해야 한다.

```text
Application policy
thread pool / connection pool / queue
            ↓
Runtime / JVM
Java thread / heap / native call
            ↓
Operating System
scheduler / virtual memory / fd / socket
            ↓
Hardware
CPU / RAM / storage / NIC
```

운영체제를 resource manager라고 부르는 이유는 단순히 resource 목록을 보관해서가 아니다. **여러 실행 주체가 제한된 hardware를 동시에 사용해도 서로 격리되고, 공정하게 또는 정책에 따라 배분되고, 실패 후 다시 회수될 수 있도록 전체 lifecycle을 관리하기 때문**이다.
