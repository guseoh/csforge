---
kind: concept
contentKey: computer-architecture.core.isa-execution.registers
topicContentKey: computer-architecture.core.isa-execution
slug: registers
title: "Registers"
summary: "register file과 memory 접근의 역할 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# Registers

### 가까운 임시 상태

register는 CPU execution unit이 직접 읽고 쓰는 매우 작은 저장 공간이며 register file은 여러 register를 index로 선택한다. PC, stack pointer, status register처럼 특별한 의미를 가진 register와 일반 산술용 register는 접근 규칙이 다를 수 있다. memory보다 빠르지만 개수가 적어 모든 data를 담을 수 없다.

instruction이 memory 값을 사용하려면 load가 register를 채우고, 계산 뒤 store가 결과를 memory로 보낸다. register allocation이 잘못되면 spill 때문에 stack memory 접근이 늘어나며, register 이름만 보고 실제 latency가 항상 같다고 단정할 수 없다.

### Backend 연결

native 호출 경계에서는 caller/callee-saved register와 ABI를 지켜야 한다. 성능 분석에서 local variable 수보다 실제 load/store와 spill을 관찰하고, unsafe code가 register state를 보존한다는 전제를 명시한다.
