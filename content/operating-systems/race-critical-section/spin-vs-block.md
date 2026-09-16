---
kind: concept
contentKey: operating-systems.core.race-critical-section.spin-vs-block
topicContentKey: operating-systems.core.race-critical-section
slug: spin-vs-block
title: "Spin / Block"
summary: "waiting 동안 CPU를 소비하는 spin과 scheduler에 CPU를 양보하는 blocking의 비용 모델을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf"
    title: "Operating Systems: Three Easy Pieces — Locks"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "mutex/lock이 atomic primitive를 이용해 critical section의 mutual exclusion을 구현하는 방식을 확인한다."
    displayOrder: 1
  - url: "https://www.man7.org/linux/man-pages/man3/pthread_spin_lock.3.html"
    title: "pthread_spin_lock(3) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "contended spin lock이 lock 상태를 반복 확인하며 CPU를 소비하는 동작을 확인한다."
    displayOrder: 2
---
# Spin / Block

경쟁 중인 resource를 바로 얻지 못했을 때 실행 흐름은 기다려야 한다. 이때 대표적인 선택이 **spin**과 **block**이다.

Spin은 조건이 만족될 때까지 CPU에서 반복 확인한다. Sleep/wakeup과 scheduler 전환 비용을 피할 수 있지만 기다리는 동안에도 CPU cycle을 계속 사용한다.

Block은 현재 실행 흐름을 waiting 상태로 보내 CPU를 다른 runnable task에 양보한다. 대신 wait queue 관리, sleep/wakeup과 scheduling 비용이 생긴다.

| 기준 | Spin | Block |
| --- | --- | --- |
| waiting 중 CPU | 계속 사용 | 다른 task에 양보 |
| 매우 짧은 wait | 유리할 수 있음 | 전환 비용이 더 클 수 있음 |
| 긴 wait | CPU 낭비가 커짐 | 보통 더 적합 |
| owner가 실행되지 못함 | 특히 불리 | CPU 경쟁을 줄일 수 있음 |

### 선택 기준은 예상 대기 시간과 CPU 여유다

다른 CPU에서 lock owner가 곧 critical section을 끝낼 가능성이 높다면 짧은 spin이 sleep/wakeup보다 쌀 수 있다. 반대로 owner가 preempt되었거나 긴 작업을 수행 중이면 spinner는 lock이 풀리지 않는 동안 CPU만 소비한다.

Runnable task가 CPU 수보다 많은 oversubscribed 상황에서는 여러 spinner가 CPU를 차지하면서 오히려 lock을 풀어야 할 owner의 실행 기회를 줄일 수도 있다.

실제 synchronization primitive는 잠깐 spin한 뒤 block하는 adaptive 전략을 사용할 수 있다. Spin / Block의 핵심은 **고정된 우열이 아니라, 기다리는 동안 CPU를 계속 쓸지 scheduler에 양보할지에 따른 비용 trade-off**다.