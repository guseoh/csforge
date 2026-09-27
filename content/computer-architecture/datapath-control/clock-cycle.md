---
kind: concept
contentKey: computer-architecture.core.datapath-control.clock-cycle
topicContentKey: computer-architecture.core.datapath-control
slug: clock-cycle
title: "클록 주기(Clock Cycle)"
summary: "동기식 CPU에서 클록 에지가 상태 갱신 시점을 맞추고 주기와 주파수가 어떤 관계인지 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    relationNote: "클록 주기·주파수·CPI가 CPU 실행 시간과 연결되는 부분을 확인한다."
    displayOrder: 1
---
# 클록 주기(Clock Cycle)

CPU의 ALU와 멀티플렉서 같은 조합 논리는 입력이 바뀐 직후 최종 출력이 완성되는 것이 아니라 작은 전파 지연을 거쳐 안정된다. 반면 레지스터와 PC 같은 상태 요소는 값을 계속 기억해야 한다. 동기식 CPU는 **클록 에지를 기준으로 언제 새로운 상태를 받아들일지** 맞춘다.

```text
clock edge        combinational logic        next clock edge
    │                     │                         │
state Q ───────────────> 계산 ────────────────> new state
```

한 에지에서 레지스터 값이 바뀐 뒤 조합 논리가 다음 값을 계산하고, 다음 에지 전에 그 값이 안정되어야 한다.

### 주기와 주파수는 역수 관계다

클록 주기(cycle time)는 한 주기가 걸리는 시간이고, 클록 주파수(clock frequency)는 초당 몇 주기가 반복되는지를 뜻한다.

```text
cycle time = 1 / frequency
```

예를 들어 2 GHz라면 이상화한 한 주기는 0.5 ns다. 다만 GHz가 높다는 사실만으로 실제 프로그램이 반드시 더 빨라지는 것은 아니다. 명령어당 필요한 평균 주기 수(CPI), 캐시 미스, 분기 예측 실패 같은 요인이 함께 실행 시간을 결정한다.

### 한 주기가 명령어 하나의 전체 실행 시간이라는 뜻은 아니다

단순한 single-cycle 설계에서는 명령어 하나를 한 주기에 끝내도록 만들 수 있지만, 파이프라인에서는 여러 명령어가 여러 단계에 걸쳐 겹쳐 진행된다. 반대로 어떤 설계는 한 명령어에 여러 주기를 사용할 수도 있다.

따라서 `클록 주기 = 명령어 한 개의 지연 시간`으로 고정해서 이해하지 않는다. 클록은 하드웨어 상태 갱신의 시간 기준이고, 명령어 지연 시간과 처리량은 마이크로아키텍처 구조에 따라 달라진다.
