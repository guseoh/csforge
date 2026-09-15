---
kind: concept
contentKey: computer-architecture.core.performance.instruction-count-cpi-clock
topicContentKey: computer-architecture.core.performance
slug: instruction-count-cpi-clock
title: "Instruction Count·CPI·Clock"
summary: "CPU time을 instruction count·average CPI·clock cycle time으로 분해하고 각 항이 성능에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    displayOrder: 1
---
# Instruction Count·CPI·Clock

CPU execution time은 대표적으로 다음 세 요소로 나누어 생각할 수 있다.

```text
CPU time
= Instruction Count × CPI × Cycle Time
= Instruction Count × CPI / Clock Rate
```

Instruction Count는 실제 실행된 architectural instruction 수이고, CPI(Cycles Per Instruction)는 instruction 하나당 평균 몇 cycle이 사용됐는지 나타낸다. Cycle Time은 clock 한 주기의 길이다.

이 식의 목적은 `CPU가 느리다`는 결과를 **instruction 수, cycle 효율, clock**이라는 서로 다른 원인으로 분해하는 것이다.

### Instruction 수가 적다고 항상 빠른 것은 아니다

다음 두 실행을 비교해 보자.

```text
A: 1,000 instructions × CPI 1.0 = 1,000 cycles
B:   700 instructions × CPI 1.8 = 1,260 cycles
```

Clock이 같다면 B는 instruction 수가 더 적지만 더 많은 cycle이 필요하다. Instruction count 하나만으로 성능을 판단할 수 없는 이유다.

### CPI는 workload와 microarchitecture의 결과다

CPI는 모든 instruction이 고정된 같은 cycle 수를 사용한다는 뜻이 아니다. Cache miss, branch misprediction, data dependency와 execution resource 충돌이 stall을 만들면 평균 CPI가 올라갈 수 있다.

따라서 특정 CPU에 `CPI는 항상 1` 같은 하나의 값이 붙는 것이 아니다. 같은 processor에서도 실행하는 workload와 memory behavior에 따라 평균 CPI가 달라진다.

### Clock rate 역시 혼자 보지 않는다

Clock rate를 높이면 cycle time은 짧아지지만 전체 CPU time은 instruction count와 CPI에도 영향을 받는다. 더 높은 clock을 위해 pipeline을 깊게 만들었는데 branch recovery 비용이 커지면 CPI가 증가할 수 있다.

그래서 GHz만 비교하거나 instruction 수만 비교하는 대신 세 요소가 함께 만든 최종 CPU time을 본다.

```text
program / compiler → Instruction Count
microarchitecture + workload → CPI
hardware timing → Cycle Time
```

다음 Concept에서는 전체 실행 중 일부만 빨라졌을 때 전체 speedup이 왜 제한되는지 Amdahl's Law로 본다.
