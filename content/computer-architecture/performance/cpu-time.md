---
kind: concept
contentKey: computer-architecture.core.performance.cpu-time
topicContentKey: computer-architecture.core.performance
slug: cpu-time
title: "CPU 실행 시간(CPU Time)"
summary: "CPU 실행 시간과 경과 시간을 구분하고 CPU가 실제 명령어를 실행한 시간을 해석한다."
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
# CPU 실행 시간(CPU Time)

경과 시간(elapsed time)은 작업을 시작한 순간부터 끝날 때까지 실제로 흐른 전체 시간이다. 반면 CPU 실행 시간은 그중 CPU가 해당 프로그램의 명령어를 실행하는 데 사용한 시간에 초점을 둔다.

프로그램이 입출력을 기다리거나 스케줄러에 의해 실행되지 않는 동안에도 경과 시간은 흐르지만 그 시간이 모두 CPU 실행 시간에 포함되는 것은 아니다.

```text
경과 시간
├─ CPU에서 명령어 실행
├─ I/O 기다림
├─ scheduler 대기
└─ 기타 대기
```

### CPU 실행 시간은 주기 수와 클록으로 표현할 수 있다

단순한 하드웨어 모델에서는 다음 관계를 사용할 수 있다.

```text
CPU time = CPU cycles × cycle time
         = CPU cycles / clock rate
```

같은 프로그램이라도 캐시 미스, 분기 예측 실패, 의존성 스톨이 늘어나면 필요한 주기 수가 많아질 수 있다. 그래서 같은 클록 주파수라고 CPU 실행 시간까지 같아지는 것은 아니다.

반대로 클록 주파수가 높아져도 메모리를 기다리는 스톨까지 같은 비율로 줄어드는 것은 아니다.

### CPU 사용률과도 구분한다

CPU 사용률은 일정 시간 동안 CPU 자원이 얼마나 사용되었는지를 나타내는 지표다. 여러 코어를 동시에 사용하는 프로그램이라면 실제 시간 1초 동안 누적 CPU 실행 시간이 1초보다 클 수도 있다.

따라서 `CPU가 80% 사용됐다`는 말과 `작업 시간의 80%가 CPU 계산이었다`는 말을 같은 의미로 사용하면 안 된다.

CPU 성능을 분석할 때는 경과 시간, CPU 실행 시간, 주기 수를 각각 다른 측정 경계로 본다. 다음 Concept에서는 CPU 실행 시간을 명령어 수, CPI와 클록으로 더 세분화한다.
