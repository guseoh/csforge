---
kind: concept
contentKey: operating-systems.core.scheduling.context-switch
topicContentKey: operating-systems.core.scheduling
slug: context-switch
title: "Context Switch"
summary: "현재 register/context를 저장하고 다른 runnable process를 재개한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/sched.7.html"
    title: "sched(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "scheduler 정책과 context 전환 비용을 확인한다."
    displayOrder: 1
---
# Context Switch

context switch는 현재 실행 흐름의 register, program counter, stack과 scheduling 상태를 저장하고 다른 runnable 흐름의 context를 복원하는 작업이다. process switch는 address-space 전환까지 포함할 수 있어 단순 함수 호출보다 비용이 크다.

switch 자체는 유용한 작업을 수행하지 않으므로 너무 잦으면 throughput이 떨어진다. 반대로 한 흐름을 오래 실행하면 latency와 fairness가 나빠지므로 workload와 quantum을 함께 조정한다.

### Backend 연결

thread pool의 worker 수를 CPU 수보다 무조건 크게 잡으면 blocking과 context switch가 늘어난다. CPU 사용률만 보지 말고 runnable queue, latency, voluntary/involuntary switch를 함께 관찰한다.

