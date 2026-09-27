---
kind: concept
contentKey: computer-architecture.core.isa-execution.instruction-format
topicContentKey: computer-architecture.core.isa-execution
slug: instruction-format
title: "명령어 형식(Instruction Format)"
summary: "명령어 비트 패턴을 opcode·레지스터·immediate 같은 필드로 나누어 CPU가 연산과 피연산자를 해석하는 방식을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.riscv.org/reference/isa/unpriv/rv32.html"
    title: "RV32I Base Integer Instruction Set"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RV32I instruction formats, registers, load/store와 control-transfer encoding을 확인한다."
    displayOrder: 1
---
# 명령어 형식(Instruction Format)

CPU가 실행하는 명령어도 메모리에 저장된 비트 패턴이다. ISA는 이 비트들을 여러 필드로 나누어 어떤 연산을 수행하고, 어떤 레지스터나 상수를 피연산자로 사용할지 정한다.

대표적인 필드는 다음과 같다.

- **opcode**: 어떤 종류의 연산인지 구분한다.
- **register field**: 읽거나 쓸 아키텍처 레지스터를 선택한다.
- **immediate**: 명령어 안에 직접 포함된 작은 상수나 오프셋을 표현한다.
- **function field**: 같은 opcode 계열 안에서 세부 연산을 구분할 수 있다.

RISC-V RV32I를 예로 들면 기본 명령어는 32비트이며 R-type, I-type, S-type처럼 여러 형식을 사용한다. 모든 명령어가 같은 필드를 가지는 것은 아니지만 자주 사용하는 레지스터 필드의 위치를 비슷하게 두어 해독을 단순하게 만드는 구조를 사용한다.

```text
32-bit instruction
┌────────┬────────┬────────┬────────┐
│ opcode │ rs/rd  │ funct  │ imm... │
└────────┴────────┴────────┴────────┘
        실제 배치는 format마다 다름
```

필드의 비트 수는 표현 가능한 범위를 제한한다. 예를 들어 5-bit 레지스터 인덱스라면 2^5, 즉 32개의 레지스터 중 하나를 선택할 수 있다. Immediate 필드가 작으면 큰 상수나 먼 목적지를 명령어 하나에 모두 담지 못해 여러 명령어를 조합해야 할 수 있다.

따라서 명령어 형식은 단순한 이진 문법이 아니라 **제한된 명령어 폭 안에 연산 종류와 피연산자 정보를 어떻게 배치할지 정한 ISA 계약**이다. 실제 원시 바이트를 해석할 때도 먼저 대상 ISA와 명령어 경계를 알아야 하며, 같은 비트 패턴이라도 데이터인지 명령어인지에 따라 의미가 완전히 달라진다.
