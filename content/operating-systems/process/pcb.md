---
kind: concept
contentKey: operating-systems.core.process.pcb
topicContentKey: operating-systems.core.process
slug: pcb
title: "Process Control Block"
summary: "kernel이 process identity·execution state·resource references를 추적하는 metadata 역할을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.kernel.org/scheduler/sched-arch.html"
    title: "Linux Scheduler Architecture"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "scheduler와 task state/context 전환이 kernel execution metadata와 연결되는 관점을 확인한다."
    displayOrder: 1
---
# Process Control Block

CPU에서 실행되던 process를 잠시 멈췄다가 나중에 다시 실행하려면 “어디까지 실행했는가”뿐 아니라 그 process가 누구이고 어떤 resource와 execution state를 갖는지 kernel이 기억해야 한다. 교과서에서는 이런 kernel-side process metadata의 개념적 묶음을 **PCB(Process Control Block)**라고 부른다.

PCB를 특정 OS의 실제 struct 이름과 동일하다고 생각하면 안 된다. Linux처럼 thread/task abstraction을 중심으로 구현하는 OS에서는 metadata가 여러 kernel structure에 나뉠 수 있다. 중요한 것은 정확한 field 이름을 외우는 것이 아니라 **OS가 process lifecycle과 scheduling을 위해 어떤 종류의 state를 보존해야 하는지** 이해하는 것이다.

### 어떤 정보가 필요한가

개념적으로 다음 종류의 정보가 필요하다.

```text
Process identity
PID, credentials, parent relation ...

Execution state
running/runnable/sleeping 등
saved CPU context

Scheduling metadata
priority, policy, runtime accounting ...

Memory relation
address-space / page-table 관련 reference

Resources
open file, signal state 등 OS-managed references
```

CPU register 전체가 항상 하나의 “PCB field”에 그대로 들어간다고 일반화할 필요는 없다. Context switch에서 필요한 register/context 일부는 architecture-specific kernel stack이나 task structure 등에 저장될 수 있다. 여기서 핵심 역할은 **현재 task의 execution을 중단하고 나중에 일관되게 재개할 수 있는 kernel-side state를 유지하는 것**이다.

### Context switch와 PCB 역할

Task A가 실행 중이고 scheduler가 Task B를 선택한다고 하자.

```text
CPU executes A
     │
     ├─ A의 필요한 execution context 저장
     │
     ├─ scheduler가 B 선택
     │
     └─ B의 context 복원
             ↓
        CPU executes B
```

이 과정에는 register context 외에도 어떤 address space를 사용할지, scheduler accounting을 어떻게 갱신할지 같은 kernel state가 연관된다. 잘못된 task state나 address-space relation을 복원하면 다른 process의 실행 상태를 섞는 치명적인 오류가 된다.

### Process state와 resource lifecycle도 연결된다

PCB 성격의 metadata는 context switch 때만 필요한 것이 아니다. Process가 waiting인지 runnable인지, parent가 누구인지, exit status가 남아 있는지 같은 정보도 lifecycle 관리에 필요하다.

Process가 종료되면 address space와 대부분의 resource는 회수되더라도 parent가 종료 status를 수집하기 전까지 최소한의 process metadata가 남을 수 있다. 이것이 뒤에서 다룰 zombie/reap 상태와 연결된다.

### Backend에서 PCB 자체를 직접 만지지는 않는다

Java Backend는 kernel PCB를 조작하지 않는다. 하지만 `ps`, process metrics, scheduler statistics, thread dump를 읽을 때 보고 있는 정보의 층을 구분해야 한다.

- Thread dump: JVM thread와 application-level stack 상태를 보여준다.
- OS process/task metric: scheduler가 보는 runnable/waiting, CPU accounting 등을 보여준다.
- Business job state: application domain이 관리한다.

세 상태를 하나로 합치면 “Java thread가 RUNNABLE이니 반드시 CPU에서 지금 실행 중이다” 같은 잘못된 결론을 낼 수 있다. Process Control Block 개념은 **OS가 실행 주체를 재개하고 lifecycle을 관리하기 위해 kernel-side state를 지속적으로 보존한다는 것**을 이해하는 기반이다.
