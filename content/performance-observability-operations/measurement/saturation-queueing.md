---
kind: concept
contentKey: performance.core.measurement.saturation-queueing
topicContentKey: performance.core.measurement
slug: saturation-queueing
title: "saturation과 queueing"
summary: "bounded resource, queue depth, utilization과 Little's Law 직관으로 overload를 설명한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/"
    title: "Kubernetes Documentation: Resource Management for Pods and Containers"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "container resource boundary와 saturation 관측의 기반 확인"
---
# saturation과 queueing

Saturation은 CPU, memory, DB connection pool, worker, queue처럼 제한된 자원이 수요에 가까워지는 상태입니다. utilization이 100%가 되기 전에도 queue가 쌓이면 대기 시간이 늘어나고, 결국 timeout·retry가 추가 부하를 만들 수 있습니다.

### queue는 latency의 숨은 구성요소다

```text
arrival ─▶ [waiting queue] ─▶ worker/service time ─▶ response
             ▲ saturation이 높을수록 대기가 길어짐
```

Little's Law의 직관은 평균 시스템 내 작업 수가 도착률과 평균 체류 시간의 곱으로 연결된다는 것입니다. 따라서 같은 throughput을 처리하더라도 queue depth가 증가하면 요청이 시스템에 머무는 시간이 증가합니다. 이 관계는 정확한 capacity 계산의 출발점이지 모든 분산 시스템을 단순한 공식 하나로 설명하는 만능 법칙은 아닙니다.

### 자원별 saturation 신호가 다르다

CPU는 run queue와 throttling, memory는 allocation pressure와 GC/OOM, database는 active connection과 lock wait, queue worker는 backlog와 processing age로 포화가 드러납니다. 단일 CPU percentage만 보면 downstream 병목이나 thread pool starvation을 놓칠 수 있습니다.

### overload를 전파하지 않는다

queue 상한, admission control, timeout budget, bounded concurrency와 load shedding으로 유입량을 제한합니다. 무제한 buffer는 장애를 숨기다가 memory pressure와 긴 tail latency로 바꾸므로, 버려진 작업의 의미와 재처리 정책도 함께 기록해야 합니다.

### 문제를 풀 때 확인할 것

1. 병목이 될 bounded resource를 찾습니다.
2. utilization뿐 아니라 queue depth·age와 wait time을 봅니다.
3. queue 상한과 timeout·retry budget을 설정합니다.
4. overload 시 shed할 요청과 보존할 요청을 정합니다.
5. downstream capacity까지 포함해 admission을 조정합니다.

### 면접에서 설명한다면

Saturation은 자원 사용률 하나가 아니라 제한된 자원 앞의 대기와 처리 지연이 커지는 상태입니다. queue depth·age, active workers, wait time을 관측하고 bounded queue·concurrency·timeout·load shedding으로 overload가 다음 계층으로 전파되지 않게 합니다.
