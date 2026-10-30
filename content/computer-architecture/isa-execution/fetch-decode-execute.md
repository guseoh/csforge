---
kind: concept
contentKey: computer-architecture.core.isa-execution.fetch-decode-execute
topicContentKey: computer-architecture.core.isa-execution
slug: fetch-decode-execute
title: "명령어 인출·해독·실행(Fetch-Decode-Execute)"
summary: "PC가 가리키는 명령어를 가져와 해석하고 피연산자를 처리한 뒤 레지스터·메모리·PC 같은 아키텍처 상태를 갱신하는 논리 흐름을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.riscv.org/reference/isa/unpriv/rv32.html"
    title: "RV32I Base Integer Instruction Set"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RV32I instruction formats, registers, load/store와 control-transfer encoding을 확인한다."
    displayOrder: 1
---
# 명령어 인출·해독·실행(Fetch-Decode-Execute)

프로그램 카운터(PC)는 다음에 실행할 명령어의 주소를 나타낸다. 프로세서는 PC가 가리키는 명령어를 가져오고(fetch), 비트 필드를 해석해 어떤 연산과 피연산자가 필요한지 판단한 뒤(decode), 실제 계산이나 메모리 접근을 수행한다(execute).

입문 단계에서는 다음 흐름으로 생각할 수 있다.

```text
PC
 ↓
Fetch instruction
 ↓
Decode opcode / operands
 ↓
Execute operation
 ↓
필요하면 memory access / result write
 ↓
다음 PC 결정
```

예를 들어 덧셈 명령어는 원본 레지스터를 읽어 ALU에서 계산하고 목적지 레지스터에 결과를 기록한다. Load 명령어는 레지스터와 오프셋으로 주소를 계산한 뒤 메모리에서 값을 읽어 레지스터에 넣는다.

PC도 명령어 실행으로 바뀌는 아키텍처 상태다. 순차 실행이라면 다음 명령어 주소로 이동하지만 분기나 jump가 실행되면 조건과 목적지에 따라 다른 위치를 가리킨다.

```text
branch condition
   ├─ false → 다음 순차 instruction
   └─ true  → branch target
```

실행 중 문제가 생기면 정상적인 다음 명령어로 가지 않을 수도 있다. 지원하지 않는 명령어나 허용되지 않은 메모리 접근은 아키텍처가 정한 예외 경로로 제어를 넘길 수 있다. 그 이후 어떤 정책으로 처리할지는 OS가 담당하는 별도 층이다.

중요한 점은 fetch-decode-execute가 **명령어 하나의 아키텍처 작업을 이해하기 위한 논리 모델**이라는 것이다. 실제 현대 CPU에서는 파이프라인과 비순차 실행 때문에 여러 명령어의 내부 단계가 동시에 진행될 수 있다. 그래도 최종적으로 소프트웨어가 관찰하는 결과는 ISA가 정의한 명령어 의미를 만족해야 한다.
