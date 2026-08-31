---
kind: concept
contentKey: computer-architecture.core.isa-execution.isa-vs-microarchitecture
topicContentKey: computer-architecture.core.isa-execution
slug: isa-vs-microarchitecture
title: "ISA versus Microarchitecture"
summary: "ISA software-visible contract와 구현 내부의 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# ISA versus Microarchitecture

### 보이는 계약과 숨은 구현

ISA는 instruction, register, privilege와 memory model처럼 compiler와 operating system이 볼 수 있는 계약이다. microarchitecture는 그 instruction을 pipeline, cache, predictor, execution unit으로 구현하는 내부 설계다. 같은 ISA를 지키는 CPU라도 pipeline 깊이와 cache 크기가 다를 수 있다.

따라서 instruction count가 같아도 CPI와 branch penalty가 달라질 수 있고, 한 구현의 timing을 ISA 보장으로 일반화하면 안 된다. 반대로 software가 정의되지 않은 instruction encoding이나 timing에 의존하면 다른 구현에서 깨진다.

### Backend 연결

native library와 deployment CPU를 선택할 때 instruction set compatibility와 실제 microarchitecture 성능을 별도로 검증한다. benchmark 결과를 이식 가능한 correctness 계약으로 기록하지 말고, 필요한 feature detection과 fallback을 둔다.
