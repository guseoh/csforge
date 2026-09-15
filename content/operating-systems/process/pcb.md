---
kind: concept
contentKey: operating-systems.core.process.pcb
topicContentKey: operating-systems.core.process
slug: pcb
title: "Process Control Block"
summary: "kernel이 process identity·execution state·scheduling·resource relation을 추적하는 metadata 역할을 설명한다."
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

운영체제가 process를 CPU에서 잠시 멈췄다가 나중에 다시 실행하려면 실행 위치뿐 아니라 process의 identity, scheduling state와 resource relation을 기억해야 한다. 교과서에서는 이런 kernel-side metadata의 개념적 묶음을 **PCB(Process Control Block)**라고 부른다.

PCB는 특정 OS의 실제 struct 이름과 반드시 일치하는 개념은 아니다. 구현에서는 state가 여러 kernel structure에 나뉠 수 있지만, process lifecycle을 관리하기 위해 필요한 정보의 종류는 비슷하다.

```text
Process metadata
├─ identity / credentials
├─ execution state
├─ scheduling metadata
├─ address-space relation
└─ open resource / signal relation
```

### Context switch에서 재개 가능한 state가 필요하다

Scheduler가 Process A 대신 B를 실행하려면 A의 필요한 CPU context를 보존하고 B의 context를 복원해야 한다.

```text
A running
   ↓ save A context
scheduler selects B
   ↓ restore B context
B running
```

정확히 어떤 register가 어디에 저장되는지는 architecture와 OS 구현에 따라 다를 수 있다. PCB를 `모든 register가 들어 있는 하나의 구조체`로 외우기보다 **process를 중단하고 다시 이어가기 위해 kernel이 상태를 지속적으로 추적한다**고 이해하는 편이 정확하다.

### PCB 성격의 state는 scheduling 외 lifecycle에도 쓰인다

Process가 ready인지 waiting인지, parent가 누구인지, exit status가 남아 있는지 같은 정보도 process lifecycle 관리에 필요하다.

Process가 종료되어 address space와 대부분의 실행 resource가 회수된 뒤에도 parent가 termination status를 수집할 때까지 최소한의 metadata가 남을 수 있다. 이 상태는 뒤의 Wait·Reap Concept과 연결된다.
