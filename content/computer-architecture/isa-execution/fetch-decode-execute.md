---
kind: concept
contentKey: computer-architecture.core.isa-execution.fetch-decode-execute
topicContentKey: computer-architecture.core.isa-execution
slug: fetch-decode-execute
title: "Fetch-Decode-Execute"
summary: "PC에서 시작해 instruction이 fetch·decode·execute되고 architectural state를 갱신하는 흐름을 설명한다."
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
# Fetch-Decode-Execute

### PC에서 한 instruction의 실행이 시작된다

Program Counter(PC)는 다음에 실행할 instruction의 address를 나타내는 architectural state다. Processor는 PC가 가리키는 instruction bytes를 instruction memory hierarchy에서 가져오고(fetch), bit field를 해석해 어떤 연산과 operand가 필요한지 결정한다(decode). 이후 register 값을 읽고 ALU 계산, load/store address 계산, branch condition 평가 같은 실제 동작을 수행한다(execute).

단순한 설명에서는 이 과정을 `fetch → decode → execute → memory → writeback`처럼 순서대로 그릴 수 있다. 이 모델의 목적은 한 instruction이 어떤 state를 읽고 어떤 state를 바꾸는지 이해하는 것이다. 실제 modern processor가 반드시 한 instruction을 이 단계 하나씩 끝낸 뒤 다음 instruction을 시작한다는 뜻은 아니다.

### PC도 실행 결과에 따라 달라진다

순차 instruction이라면 다음 PC는 일반적으로 다음 instruction address가 된다. 하지만 branch, jump, call, return은 control flow를 바꾸므로 PC가 다른 target을 가리키게 한다. RISC-V의 `JAL`처럼 instruction 자체가 다음 PC와 return address를 함께 결정하는 경우도 있다.

예를 들어 다음 흐름을 생각할 수 있다.

```text
PC = 0x1000
   │
   ├─ fetch instruction
   ▼
decode: branch x5, x6, target
   │
   ├─ compare operands
   ▼
condition true ?
   ├─ yes → PC = target
   └─ no  → PC = sequential next
```

그래서 instruction execution은 ALU 결과 하나만 만드는 작업이 아니다. Register, memory, PC, exception state 중 무엇을 어떻게 갱신하는지가 instruction semantics다.

### 실행 도중 fault와 exception이 control flow를 바꿀 수 있다

Fetch가 성공했다고 instruction 전체가 성공한 것은 아니다. Instruction fetch 자체에서 page/protection fault가 날 수 있고, decode 후 unsupported/illegal encoding이 발견될 수도 있으며, load/store address를 실제로 접근하는 시점에 access fault가 발생할 수도 있다.

이때 processor는 임의로 다음 instruction을 계속 실행하는 것이 아니라 architecture가 정한 exception mechanism으로 control을 넘긴다. OS는 fault 원인에 따라 page를 준비하거나 process에 signal을 전달하는 등의 policy를 수행한다. Hardware exception entry와 OS policy는 같은 층이 아니다.

### Pipeline에서는 여러 instruction의 단계가 겹친다

Pipeline processor에서는 instruction A가 execute에 있는 동안 instruction B는 decode, instruction C는 fetch에 있을 수 있다. 따라서 `fetch-decode-execute`는 architectural work의 논리 흐름이지 modern CPU 내부의 시간표를 그대로 뜻하지 않는다.

Branch prediction, forwarding, out-of-order execution이 추가되어도 최종적으로 software가 관찰하는 architectural state는 ISA contract를 만족해야 한다. Pipeline과 speculation은 이 결과를 더 빠르게 만들기 위한 microarchitecture 기법이다.

Crash 분석에서도 이 층위를 구분한다. Application stack trace, OS signal, fault PC, register dump와 memory mapping은 서로 다른 수준의 증거다. Illegal instruction이나 segmentation fault를 조사할 때는 어떤 instruction과 address가 어떤 단계에서 fault를 만들었는지 연결해서 본다.
