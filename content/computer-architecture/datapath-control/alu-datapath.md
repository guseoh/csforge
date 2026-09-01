---
kind: concept
contentKey: computer-architecture.core.datapath-control.alu-datapath
topicContentKey: computer-architecture.core.datapath-control
slug: alu-datapath
title: "ALU and Datapath"
summary: "register·ALU·memory·writeback 사이에서 instruction data가 이동하는 datapath를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf"
    title: "Computer Organization: Datapath"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register file, ALU, memory와 instruction execution datapath의 연결을 확인한다."
    displayOrder: 1
---
# ALU and Datapath

### Instruction의 의미는 값이 흐르는 경로로 구현된다

Datapath는 instruction을 실행하는 동안 data가 이동하고 변환되는 hardware 경로다. Register file에서 operand를 읽고, multiplexer가 필요한 입력을 선택하고, ALU가 계산을 수행하며, 필요하면 data memory를 접근한 뒤 결과를 다시 register에 기록한다. ISA에서 `ADD`, `LOAD`, `STORE`처럼 서로 다른 의미를 가진 instruction은 같은 hardware component 일부를 공유하면서도 서로 다른 경로를 사용한다.

ALU(Arithmetic Logic Unit)는 덧셈·뺄셈·AND·OR·비교 같은 연산을 수행하는 combinational logic이다. 하지만 CPU datapath 전체가 ALU 하나라는 뜻은 아니다. PC, register file, immediate generator, mux, memory interface, pipeline register 같은 component도 함께 있어야 instruction의 architectural effect를 만들 수 있다.

### R-type 계산과 load는 같은 ALU를 다르게 사용한다

단순한 R-type arithmetic을 생각해 보자.

```text
register rs1 ─┐
              ├─> ALU ──> result ──> register rd
register rs2 ─┘
```

두 source register 값을 ALU에 넣고 연산 결과를 destination register에 기록한다.

Load instruction에서는 같은 ALU가 memory address 계산에 쓰일 수 있다.

```text
register rs1 ─┐
              ├─> ALU(add) ──> effective address ──> data memory
 immediate  ──┘                                  │
                                                ▼
                                          loaded value
                                                │
                                                ▼
                                           register rd
```

즉 ALU의 역할은 instruction마다 달라질 수 있다. `ADD`에서는 최종 data result를 만들고, `LOAD`에서는 address를 계산한다. Control logic은 mux와 write-enable을 설정해 어느 값이 어느 경로를 지나갈지 선택한다.

### Combinational logic과 state를 구분한다

ALU와 mux는 입력이 바뀌면 전파 지연 뒤 출력이 바뀌는 combinational logic이다. 반면 register와 PC는 clock edge를 기준으로 state를 보존하는 sequential element다. 이 구분이 있어야 Clock Cycle과 Critical Path를 이해할 수 있다.

한 cycle 안에서 `register output → combinational datapath → next register input`이 안정되어야 다음 clock edge에서 올바른 state를 저장할 수 있다. 따라서 datapath가 길어지면 clock period의 하한에도 영향을 준다.

### Datapath 문제와 pipeline hazard는 같은 문제가 아니다

Operand가 아직 준비되지 않았거나 execution resource가 충돌하는 문제는 pipeline scheduling/hazard와 연결된다. Datapath라는 물리적 경로가 존재하는 것만으로 dependency가 해결되는 것은 아니다. Forwarding network, stall control, multiple execution unit 같은 microarchitecture mechanism이 추가로 필요할 수 있다.

Backend 성능 분석에서도 source expression 수만 세지 않는다. JIT가 만든 실제 instruction dependency, load/store, vector instruction과 cache miss를 함께 봐야 한다. 다만 이런 microarchitecture 성능 특성을 Java language guarantee나 application correctness 규칙으로 일반화해서는 안 된다.
