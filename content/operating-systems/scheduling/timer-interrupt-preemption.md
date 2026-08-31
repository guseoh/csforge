---
kind: concept
contentKey: operating-systems.core.scheduling.timer-interrupt-preemption
topicContentKey: operating-systems.core.scheduling
slug: timer-interrupt-preemption
title: "Timer Interrupt and Preemption"
summary: "timer interrupt가 실행 process를 선점 가능한 상태로 바꾸는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man7/sched.7.html"
    title: "sched(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "scheduler 정책과 context 전환 비용을 확인한다."
    displayOrder: 1
---
# Timer Interrupt and Preemption

periodic timer interrupt는 running process가 CPU를 독점하지 않도록 scheduler가 다시 선택할 기회를 만든다. handler는 현재 context를 보존하고 runnable queue와 priority를 평가한 뒤 필요하면 다른 흐름으로 전환한다.

preemption 지점이 있다고 해서 모든 kernel code가 언제나 중단 가능한 것은 아니다. critical section, interrupt masking, lock 보유 상태는 지연과 우선순위 역전의 원인이 될 수 있다.

### Backend 연결

application timeout은 OS timer와 별개의 논리 deadline이다. scheduler 지연이 있어도 deadline이 무한히 늘어나지 않도록 monotonic clock과 cancellation을 사용한다.

