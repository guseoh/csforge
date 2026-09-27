---
kind: concept
contentKey: computer-architecture.core.device-io.interrupt-handler-entry
topicContentKey: computer-architecture.core.device-io
slug: interrupt-handler-entry
title: "인터럽트 핸들러 진입(Interrupt Handler Entry)"
summary: "대기 중인 인터럽트가 수용된 뒤 저장된 PC·원인·권한 상태를 거쳐 핸들러로 진입하고 복귀하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.riscv.org/reference/isa/priv/machine.html"
    title: "RISC-V Privileged Architecture: Machine-Level ISA"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "mtvec, mepc, mcause와 machine-level interrupt/trap entry 상태 변화를 확인한다."
    displayOrder: 1
---
# 인터럽트 핸들러 진입(Interrupt Handler Entry)

장치나 타이머가 인터럽트를 발생시켰다고 해서 그 순간 곧바로 핸들러 코드가 실행되는 것은 아니다. 먼저 인터럽트가 대기(pending) 상태가 되고, 활성화 여부·우선순위·현재 권한 수준 같은 아키텍처 조건을 만족해 CPU가 그 인터럽트를 받아들여야 한다.

```text
event 발생
   ↓
interrupt pending
   ↓
CPU accepts interrupt
   ↓
trap entry
   ↓
handler 실행
```

### 핸들러로 들어가기 전에 재개에 필요한 상태를 남긴다

CPU는 핸들러가 원인을 확인하고 나중에 원래 실행으로 돌아갈 수 있도록 아키텍처가 정한 상태를 기록한다. RISC-V machine-level trap을 예로 들면 `mepc`는 재개와 관련된 PC를, `mcause`는 트랩 원인을 담고 `mtvec`는 핸들러 진입 위치를 결정하는 데 사용된다.

이 상태가 있어야 핸들러가 `무슨 일이 발생했는가`와 `어디로 돌아갈 것인가`를 판단할 수 있다.

### 일반 함수 호출과 같은 방식으로 생각하면 안 된다

트랩은 임의의 명령어 실행 중에 비동기적으로 들어올 수 있다. 하드웨어가 모든 범용 레지스터를 자동으로 저장한다고도 가정할 수 없다. 핸들러 소프트웨어는 자신이 덮어쓸 레지스터와 필요한 추가 문맥을 아키텍처와 OS 규칙에 맞춰 보존해야 할 수 있다.

```text
trap entry
   ↓
save required context
   ↓
inspect cause
   ↓
handle event
   ↓
restore context
   ↓
return from trap
```

### 장치 인터럽트는 원인 상태도 처리해야 한다

외부 장치 인터럽트에서는 CPU가 핸들러로 진입한 것만으로 장치 이벤트가 사라지지 않을 수 있다. 소프트웨어는 장치 상태나 완료 상태를 확인하고, 장치 계약에 따라 이벤트 원인을 acknowledge하거나 clear해야 한다.

핸들러 안에서 얼마나 많은 일을 할지는 OS 정책이다. 하드웨어/ISA는 트랩 진입과 복귀 메커니즘을 제공하지만, 긴 처리를 지연 작업으로 넘길지 같은 운영 정책까지 정하지는 않는다.
