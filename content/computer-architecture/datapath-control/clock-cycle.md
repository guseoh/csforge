---
kind: concept
contentKey: computer-architecture.core.datapath-control.clock-cycle
topicContentKey: computer-architecture.core.datapath-control
slug: clock-cycle
title: "Clock Cycle"
summary: "동기식 CPU에서 clock edge가 state 갱신 시점을 맞추고 cycle time과 frequency가 서로 어떤 관계인지 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/cmsc411/legacy/overview/chapter01.html"
    title: "CMSC411 Chapter 1 Notes — Computer Performance"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "clock cycle time, clock rate, CPI와 CPU execution time의 관계를 함께 확인한다."
    displayOrder: 1
---
# Clock Cycle

CPU의 ALU와 multiplexer 같은 combinational logic은 입력이 바뀌자마자 최종 출력이 완성되는 것이 아니라 작은 propagation delay를 거쳐 안정됩니다. 반면 register와 PC 같은 state element는 값을 계속 기억해야 합니다. 동기식 CPU는 **clock edge를 기준으로 언제 새로운 state를 받아들일지** 맞춥니다.

```text
Clock edge N                                Clock edge N+1
     │                                            │
     ▼                                            ▼
Source register ─▶ combinational logic ─▶ Destination register
```

첫 clock edge 뒤 source register의 값이 datapath로 전달되고, 다음 edge가 오기 전에 계산 결과가 충분히 안정되어야 destination register가 올바른 값을 저장할 수 있습니다.

두 clock edge 사이의 시간을 **cycle time**이라고 하고, 1초 동안 발생하는 cycle 수를 **clock frequency**라고 합니다. 둘은 역수 관계입니다.

```text
cycle time = 1 / clock frequency
```

예를 들어 2 GHz는 한 cycle이 약 0.5 ns라는 뜻입니다. 하지만 **0.5 ns마다 instruction 하나가 반드시 완료된다는 뜻은 아닙니다.** Instruction 하나가 몇 cycle을 필요로 하는지는 CPU 설계에 따라 다릅니다.

Cycle을 너무 짧게 만들면 datapath의 가장 느린 계산이 끝나기 전에 다음 edge가 도착할 수 있습니다. 그래서 clock period는 hardware가 안전하게 state를 전달할 수 있는 시간보다 짧아질 수 없습니다. 어떤 경로가 이 최소 시간을 결정하는지는 다음 Critical Path에서 살펴봅니다.

Clock cycle을 이해할 때 핵심은 GHz 숫자 자체가 아니라 **조합 논리가 계산하는 시간과 register가 state를 확정하는 시점을 하나의 공통 시간 기준으로 맞추는 mechanism**이라는 점입니다. Pipeline과 CPI 같은 전체 성능 문제는 뒤 Topic에서 이 기본 개념 위에 이어집니다.
