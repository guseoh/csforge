---
kind: concept
contentKey: operating-systems.core.race-critical-section.spin-vs-block
topicContentKey: operating-systems.core.race-critical-section
slug: spin-vs-block
title: "Spin versus Block"
summary: "짧은 대기에서 spin과 긴 대기에서 block을 선택하는 비용을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Spin versus Block

spin lock은 lock을 얻을 때까지 CPU에서 반복 확인하고, blocking lock은 기다리는 thread를 sleep시켜 다른 작업에 CPU를 양보한다. 기다림이 매우 짧고 CPU를 계속 사용할 수 있으면 spin의 switch 비용 회피가 이득일 수 있다.

대기 시간이 길거나 single-core, oversubscribed 환경이면 spin이 유용한 CPU를 태워 latency를 악화시킨다. critical section 길이와 scheduler, preemption 가능성을 측정해 선택한다.

### Backend 연결

application lock에서 busy-wait를 직접 구현하지 말고 검증된 primitive와 timeout을 사용한다. downstream I/O를 기다리는 동안 spin하면 worker와 CPU를 동시에 소모한다.
