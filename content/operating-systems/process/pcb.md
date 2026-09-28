---
kind: concept
contentKey: operating-systems.core.process.pcb
topicContentKey: operating-systems.core.process
slug: pcb
title: "프로세스 제어 블록(PCB)"
summary: "커널이 프로세스 식별자·실행 상태·scheduling·자원 relation을 추적하는 메타데이터 역할을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.kernel.org/scheduler/sched-arch.html"
    title: "CPU 스케줄러 implementation hints for architecture specific 코드"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux의 architecture-specific switch_to()와 runqueue lock 처리를 context-switch 구현 사례로 확인한다."
    displayOrder: 1
---
# 프로세스 제어 블록(PCB)

운영체제가 프로세스를 CPU에서 잠시 멈췄다가 나중에 다시 실행하려면 실행 위치뿐 아니라 프로세스의 식별자, scheduling 상태와 자원 relation을 기억해야 한다. 교과서에서는 이런 커널-side 메타데이터의 개념적 묶음을 **PCB(프로세스 Control Block)**라고 부른다.

PCB는 특정 OS의 실제 struct 이름과 반드시 일치하는 개념은 아니다. 구현에서는 상태가 여러 커널 structure에 나뉠 수 있지만, 프로세스 생명주기을 관리하기 위해 필요한 정보의 종류는 비슷하다.

```text
Process metadata
├─ identity / credentials
├─ execution state
├─ scheduling metadata
├─ address-space relation
└─ open resource / signal relation
```

### 문맥 switch에서 재개 가능한 상태가 필요하다

스케줄러가 프로세스 A 대신 B를 실행하려면 A의 필요한 CPU 문맥를 보존하고 B의 문맥를 복원해야 한다.

```text
A running
   ↓ save A context
scheduler selects B
   ↓ restore B context
B running
```

정확히 어떤 레지스터가 어디에 저장되는지는 architecture와 OS 구현에 따라 다를 수 있다. PCB를 `모든 register가 들어 있는 하나의 구조체`로 외우기보다 **프로세스를 중단하고 다시 이어가기 위해 커널이 상태를 지속적으로 추적한다**고 이해하는 편이 정확하다.

### PCB 성격의 상태는 scheduling 외 생명주기에도 쓰인다

프로세스가 ready인지 대기인지, 부모가 누구인지, exit status가 남아 있는지 같은 정보도 프로세스 생명주기 관리에 필요하다.

프로세스가 종료되어 address space와 대부분의 실행 자원가 회수된 뒤에도 부모가 termination status를 수집할 때까지 최소한의 메타데이터가 남을 수 있다. 이 상태는 뒤의 Wait·Reap Concept과 연결된다.
