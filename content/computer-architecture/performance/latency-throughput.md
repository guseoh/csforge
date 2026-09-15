---
kind: concept
contentKey: computer-architecture.core.performance.latency-throughput
topicContentKey: computer-architecture.core.performance
slug: latency-throughput
title: "지연 시간과 처리량"
summary: "단일 작업의 completion 지연 시간과 단위 시간 처리량을 분리하고 pipeline·concurrency가 둘을 다르게 바꾸는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    displayOrder: 1
---
# 지연 시간과 처리량

성능이 `빠르다`는 말은 무엇이 빨라졌는지에 따라 의미가 달라진다. **지연 시간(latency)** 은 작업 하나가 시작해서 끝날 때까지 걸리는 시간이고, **처리량(throughput)** 은 일정 시간 동안 완료할 수 있는 작업 수다.

두 값은 관련되어 있지만 같은 지표는 아니다.

### Pipeline은 처리량을 높여도 한 instruction의 지연 시간을 없애지 않는다

5-stage pipeline에서 instruction 하나는 여러 stage를 모두 지나야 한다. 첫 instruction의 결과가 나오기까지 여러 cycle이 필요하지만 pipeline이 채워진 뒤에는 서로 다른 instruction이 겹쳐 진행되어 이상적인 경우 매 cycle마다 하나씩 완료될 수 있다.

```text
cycle      1    2    3    4    5    6
I1        IF   ID   EX  MEM   WB
I2             IF   ID   EX  MEM   WB
I3                  IF   ID   EX  MEM   WB
```

즉 한 instruction의 latency와 전체 instruction throughput은 다른 질문이다.

### 병렬로 더 많이 진행한다고 항상 latency가 줄지는 않는다

독립적인 작업을 겹치면 idle hardware를 활용해 처리량을 높일 수 있다. 하지만 execution unit이나 memory bandwidth 같은 resource가 포화되면 추가 작업은 기다려야 한다.

```text
work 증가
   ├─ 남는 resource 존재 → throughput 증가
   └─ resource 포화      → queue/stall 증가
```

따라서 성능을 비교할 때는 `몇 초 걸렸는가`와 `초당 몇 개를 완료했는가`를 분리해야 한다. Hardware 설계에서도 latency를 줄이는 선택과 throughput을 높이는 선택이 항상 같은 것은 아니다.
