---
kind: concept
contentKey: operating-systems.core.process.pcb
topicContentKey: operating-systems.core.process
slug: pcb
title: "프로세스 제어 블록(PCB)"
summary: "커널이 프로세스 식별 정보·실행 상태·스케줄링·자원 관계를 추적하는 메타데이터의 역할을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.kernel.org/scheduler/sched-arch.html"
    title: "CPU Scheduler implementation hints for architecture specific code"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux의 architecture-specific switch_to()와 runqueue lock 처리를 context-switch 구현 사례로 확인한다."
    displayOrder: 1
---
# 프로세스 제어 블록(PCB)

운영체제가 프로세스를 CPU에서 잠시 멈췄다가 나중에 다시 실행하려면 실행 위치뿐 아니라 프로세스의 식별 정보, 스케줄링 상태와 자원 관계도 기억해야 한다. 교과서에서는 이런 **커널 측 메타데이터의 개념적 묶음**을 PCB(Process Control Block)라고 부른다.

PCB는 특정 운영체제의 실제 구조체 이름과 반드시 일치하는 개념은 아니다. 구현에서는 상태가 여러 커널 구조에 나뉠 수 있지만, 프로세스 생명주기를 관리하기 위해 필요한 정보의 종류는 비슷하다.

```text
프로세스 메타데이터
├─ 식별 정보 / 자격 정보
├─ 실행 상태
├─ 스케줄링 정보
├─ 주소 공간 관계
└─ 열린 자원 / 시그널 관계
```

### 문맥 전환에서는 재개 가능한 상태가 필요하다

스케줄러가 프로세스 A 대신 B를 실행하려면 A의 필요한 CPU 실행 문맥을 보존하고 B의 문맥을 복원해야 한다.

```text
A 실행 중
   ↓ A 문맥 저장
스케줄러가 B 선택
   ↓ B 문맥 복원
B 실행 중
```

정확히 어떤 레지스터가 어디에 저장되는지는 아키텍처와 운영체제 구현에 따라 다를 수 있다. PCB를 `모든 레지스터가 들어 있는 하나의 구조체`로 외우기보다 **프로세스를 중단하고 다시 이어가기 위해 커널이 필요한 상태를 지속적으로 추적한다**고 이해하는 편이 정확하다.

### PCB 성격의 상태는 스케줄링 외 생명주기에도 쓰인다

프로세스가 준비 상태인지 대기 상태인지, 부모가 누구인지, 종료 상태값이 남아 있는지 같은 정보도 프로세스 생명주기 관리에 필요하다.

프로세스가 종료되어 주소 공간과 대부분의 실행 자원이 회수된 뒤에도 부모가 종료 상태를 수집할 때까지 최소한의 메타데이터가 남을 수 있다. 이 상태는 뒤의 자식 프로세스 대기와 회수(Wait and Reap) Concept과 연결된다.
