---
kind: concept
contentKey: computer-architecture.core.performance.instruction-count-cpi-clock
topicContentKey: computer-architecture.core.performance
slug: instruction-count-cpi-clock
title: "명령어 수·CPI·클록(Instruction Count, CPI and Clock)"
summary: "CPU 실행 시간을 명령어 수·평균 CPI·클록 주기로 분해하고 각 항이 성능에 미치는 영향을 설명한다."
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
# 명령어 수·CPI·클록(Instruction Count, CPI and Clock)

CPU 실행 시간은 대표적으로 다음 세 요소로 나누어 생각할 수 있다.

```text
CPU time
= Instruction Count × CPI × Cycle Time
= Instruction Count × CPI / Clock Rate
```

명령어 수(Instruction Count)는 실제 실행된 아키텍처 명령어 수이고, CPI(Cycles Per Instruction)는 명령어 하나당 평균 몇 주기가 사용됐는지를 나타낸다. 클록 주기는 한 주기의 길이다.

이 식의 목적은 `CPU가 느리다`는 결과를 **명령어 수, 주기 효율, 클록**이라는 서로 다른 원인으로 분해하는 것이다.

### 명령어 수가 적다고 항상 빠른 것은 아니다

다음 두 실행을 비교해 보자.

```text
A: 1,000 instructions × CPI 1.0 = 1,000 cycles
B:   700 instructions × CPI 1.8 = 1,260 cycles
```

클록이 같다면 B는 명령어 수가 더 적지만 더 많은 주기가 필요하다. 명령어 수 하나만으로 성능을 판단할 수 없는 이유다.

### CPI는 작업 부하와 마이크로아키텍처의 결과다

CPI는 모든 명령어가 고정된 같은 주기 수를 사용한다는 뜻이 아니다. 캐시 미스, 분기 예측 실패, 데이터 의존성과 실행 자원 충돌이 스톨을 만들면 평균 CPI가 올라갈 수 있다.

따라서 특정 CPU에 `CPI는 항상 1` 같은 하나의 값이 붙는 것이 아니다. 같은 프로세서에서도 실행하는 작업 부하와 메모리 동작에 따라 평균 CPI가 달라진다.

### 클록 주파수 역시 혼자 보지 않는다

클록 주파수를 높이면 주기는 짧아지지만 전체 CPU 실행 시간은 명령어 수와 CPI에도 영향을 받는다. 더 높은 클록을 위해 파이프라인을 깊게 만들었는데 분기 복구 비용이 커지면 CPI가 증가할 수 있다.

그래서 GHz만 비교하거나 명령어 수만 비교하는 대신 세 요소가 함께 만든 최종 CPU 실행 시간을 본다.

```text
program / compiler → Instruction Count
microarchitecture + workload → CPI
hardware timing → Cycle Time
```

다음 Concept에서는 전체 실행 중 일부만 빨라졌을 때 전체 속도 향상이 왜 제한되는지 암달의 법칙으로 본다.
