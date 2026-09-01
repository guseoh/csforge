---
kind: concept
contentKey: computer-architecture.core.datapath-control.clock-cycle
topicContentKey: computer-architecture.core.datapath-control
slug: clock-cycle
title: "Clock Cycle"
summary: "동기식 CPU에서 clock이 상태 갱신 시점을 정하는 이유와 cycle time·frequency·CPI·성능의 관계를 설명한다."
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

### CPU는 왜 clock에 맞춰 상태를 바꾸는가

동기식 CPU 내부에는 register처럼 값을 보존하는 순차 회로와 ALU, decoder, multiplexer처럼 입력에 따라 결과를 계산하는 조합 논리가 연결되어 있다. 조합 논리의 출력은 입력이 바뀌는 순간 완성되는 것이 아니라 gate와 wire를 통과하는 전파 지연 뒤에 안정된다. CPU가 아무 시점에나 register 값을 바꾸면 아직 계산이 끝나지 않은 중간 값을 다음 상태로 받아들일 수 있기 때문에, 동기식 설계에서는 clock edge를 기준으로 상태를 갱신한다.

예를 들어 한 clock edge에서 source register의 값이 확정되면 그 값이 ALU와 다른 조합 논리를 통과해 다음 상태를 계산한다. 다음 clock edge가 오기 전까지 결과가 안정되어야 하고, 그 시점에 destination register가 결과를 받아들인다. 따라서 clock은 "명령어 하나를 실행하라는 신호"라기보다 **회로가 계산한 값을 언제 새로운 architectural state로 확정할지 맞추는 시간 기준**이다.

```text
Clock edge N                                      Clock edge N+1
     │                                                  │
     ▼                                                  ▼
Source Register ──► combinational logic ──► Destination Register
                    ALU / mux / decode
                    <── propagation delay ──>
```

### Cycle time과 frequency는 서로 역수다

`cycle time`은 두 clock edge 사이의 시간이고 `clock frequency` 또는 `clock rate`는 1초 동안 발생하는 cycle 수다. 두 값은 서로 역수 관계다.

```text
cycle time = 1 / clock frequency
```

예를 들어 2 GHz clock은 초당 약 20억 cycle이며 한 cycle은 약 0.5 ns다. 4 GHz라면 약 0.25 ns다. 하지만 여기서 **0.25 ns마다 instruction 하나가 반드시 완료된다고 해석하면 안 된다.** clock은 회로 상태 갱신의 단위이고, instruction이 몇 cycle을 사용하는지는 CPU의 microarchitecture에 따라 달라진다.

### 한 cycle의 길이는 가장 느린 경로보다 짧을 수 없다

한 stage 안에는 여러 조합 논리 경로가 존재한다. 그중 입력이 register에서 출발해 다음 register에 도달하기까지 가장 오래 걸리는 경로를 `critical path`라고 한다. 다음 clock edge 전에 그 경로의 결과까지 안정되어야 하므로 cycle time은 critical path delay와 register가 요구하는 timing margin보다 충분히 길어야 한다.

가령 현재 stage의 가장 느린 경로가 0.9 ns가 필요한데 cycle time을 0.7 ns로 줄이면, 다음 clock edge에서 destination register가 아직 안정되지 않은 값을 볼 수 있다. 단순히 설정에서 frequency 숫자를 높인다고 CPU가 빨라질 수 없는 이유다. 더 높은 frequency를 얻으려면 논리를 단순화하거나 pipeline stage를 나누는 등 실제 hardware 경로를 바꿔야 한다.

### Instruction latency와 throughput은 cycle과 같은 개념이 아니다

단순한 single-cycle CPU 모델에서는 instruction 하나가 한 긴 cycle 안에 모든 일을 끝내도록 설계할 수 있다. multi-cycle CPU는 한 instruction의 일을 여러 cycle로 나눈다. pipelined CPU에서는 더 나아가 서로 다른 instruction들이 각기 다른 stage를 동시에 지나간다.

```text
          Cycle 1   Cycle 2   Cycle 3   Cycle 4   Cycle 5
I1        Fetch     Decode    Execute   Memory    Writeback
I2                  Fetch     Decode    Execute   Memory
I3                            Fetch     Decode    Execute
```

위 예에서 I1의 latency는 여러 cycle이지만 pipeline이 채워진 뒤에는 이상적인 경우 매 cycle마다 새로운 instruction이 완료될 수 있다. 그래서 **한 instruction이 완료되는 데 걸리는 latency**와 **단위 시간에 몇 instruction을 완료하는지 나타내는 throughput**을 구분해야 한다.

### Clock rate만으로 CPU 성능을 비교할 수 없는 이유

프로그램의 CPU 실행 시간은 대략 instruction 수, instruction당 평균 cycle 수인 CPI, 그리고 cycle time의 영향을 함께 받는다.

```text
CPU time = Instruction Count × CPI × Cycle Time
         = Instruction Count × CPI / Clock Rate
```

같은 프로그램을 실행하는 두 CPU가 있다고 하자. A는 3 GHz지만 평균 CPI가 1.5이고, B는 4 GHz지만 평균 CPI가 2.4라면 instruction 하나당 평균 시간은 각각 약 0.5 ns와 0.6 ns다. B의 clock 숫자가 더 높아도 같은 instruction 수를 실행한다는 조건에서는 A가 더 빠를 수 있다.

CPI 역시 고정 상수가 아니다. pipeline hazard, branch misprediction, cache miss 같은 사건이 stall을 만들면 실제 workload의 평균 CPI가 증가한다. 특히 DRAM을 기다리는 수십~수백 cycle의 stall은 clock frequency를 조금 높인다고 같은 비율로 사라지지 않는다. 따라서 `GHz가 높다 = 프로그램이 반드시 빠르다`는 결론은 성립하지 않는다.

### 성능 측정에서는 wall-clock time과 CPU 실행 비용을 분리한다

Backend 요청이 500 ms 걸렸다고 해서 CPU가 500 ms 동안 계산했다는 뜻은 아니다. DB 응답, network I/O, lock, scheduler queue를 기다린 시간이 대부분일 수 있다. 이런 요청은 CPU frequency를 올려도 end-to-end latency 개선 폭이 작다.

반대로 CPU-bound 코드에서는 elapsed time만 보는 것보다 cycles, instructions, CPI/IPC, cache miss, branch miss 같은 지표를 함께 보면 시간이 어디에서 소비되는지 더 구체적으로 설명할 수 있다. Clock Cycle을 이해하는 목적은 GHz 숫자를 외우는 것이 아니라 **hardware가 시간을 어떤 단위로 진행시키고, 그 cycle들이 실제 프로그램 실행 시간으로 어떻게 누적되는지 해석하는 데 있다.**
