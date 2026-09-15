---
kind: concept
contentKey: computer-architecture.core.performance.cpu-time
topicContentKey: computer-architecture.core.performance
slug: cpu-time
title: "CPU Time"
summary: "CPU execution time과 elapsed time을 구분하고 CPU가 실제 instruction을 실행한 시간을 해석한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    displayOrder: 1
---
# CPU Time

Elapsed time은 작업을 시작한 순간부터 끝날 때까지 실제로 흐른 전체 시간이다. 반면 CPU time은 그중 CPU가 해당 program의 instruction을 실행하는 데 사용한 시간에 초점을 둔다.

Program이 I/O를 기다리거나 scheduler에 의해 실행되지 않는 동안에도 elapsed time은 흐르지만 그 시간이 모두 CPU execution time에 포함되는 것은 아니다.

```text
elapsed time
├─ CPU에서 instruction 실행
├─ I/O 기다림
├─ scheduler 대기
└─ 기타 대기
```

### CPU time은 cycle 수와 clock으로 표현할 수 있다

단순한 hardware 모델에서는 다음 관계를 사용할 수 있다.

```text
CPU time = CPU cycles × cycle time
         = CPU cycles / clock rate
```

같은 program이라도 cache miss, branch misprediction, dependency stall이 늘어나면 필요한 cycle 수가 많아질 수 있다. 그래서 같은 clock rate라고 CPU execution time까지 같아지는 것은 아니다.

반대로 clock rate가 높아져도 memory를 기다리는 stall까지 같은 비율로 줄어드는 것은 아니다.

### CPU utilization과도 구분한다

CPU utilization은 일정 시간 동안 CPU resource가 얼마나 사용되었는지를 나타내는 지표다. 여러 core를 동시에 사용하는 program이라면 wall-clock 1초 동안 누적 CPU time이 1초보다 클 수도 있다.

따라서 `CPU가 80% 사용됐다`는 말과 `작업 시간의 80%가 CPU calculation이었다`는 말을 같은 의미로 사용하면 안 된다.

CPU 성능을 분석할 때는 elapsed time, CPU time, cycles를 각각 다른 측정 경계로 본다. 다음 Concept에서는 CPU time을 instruction count, CPI와 clock으로 더 세분화한다.
