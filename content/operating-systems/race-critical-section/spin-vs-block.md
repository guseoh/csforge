---
kind: concept
contentKey: operating-systems.core.race-critical-section.spin-vs-block
topicContentKey: operating-systems.core.race-critical-section
slug: spin-vs-block
title: "바쁜 대기와 블로킹(Spin and Blocking)"
summary: "대기 중에도 CPU를 소비하는 바쁜 대기와 CPU를 다른 작업에 양보하는 블로킹의 비용을 비교한다."
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
# 바쁜 대기와 블로킹(Spin and Blocking)

경쟁 중인 자원을 바로 얻지 못했을 때 실행 흐름은 기다려야 한다. 이때 대표적인 선택이 **바쁜 대기(spin)**와 **블로킹(blocking)**이다.

바쁜 대기는 조건이 만족될 때까지 CPU에서 계속 상태를 확인한다. 수면·깨우기와 스케줄러 전환 비용을 피할 수 있지만 기다리는 동안에도 CPU 시간을 계속 소비한다.

블로킹은 현재 실행 흐름을 대기 상태로 보내 CPU를 다른 실행 가능한 작업에 양보한다. 대신 대기 큐 관리, 수면·깨우기와 스케줄링 비용이 생긴다.

| 기준 | 바쁜 대기 | 블로킹 |
| --- | --- | --- |
| 대기 중 CPU | 계속 사용 | 다른 작업에 양보 |
| 매우 짧은 대기 | 유리할 수 있음 | 전환 비용이 더 클 수 있음 |
| 긴 대기 | CPU 낭비가 커짐 | 보통 더 적합 |
| 락 소유자가 실행되지 못함 | 특히 불리 | CPU 경쟁을 줄일 수 있음 |

### 선택 기준은 예상 대기 시간과 CPU 여유다

다른 CPU에서 락 소유자가 곧 임계 구역을 끝낼 가능성이 높다면 짧은 바쁜 대기가 수면·깨우기보다 저렴할 수 있다. 반대로 소유자가 선점됐거나 긴 작업을 수행 중이면 기다리는 스레드는 락이 풀리지 않는 동안 CPU만 소비한다.

실행 가능한 작업 수가 CPU 수보다 많은 과잉 구독(oversubscription) 상황에서는 여러 스레드가 바쁜 대기로 CPU를 차지하면서 오히려 락을 풀어야 할 소유자의 실행 기회를 줄일 수도 있다.

실제 동기화 도구는 잠깐 바쁜 대기를 한 뒤 블로킹하는 적응형 전략을 사용할 수 있다. 핵심은 **바쁜 대기와 블로킹 사이에 고정된 우열이 있는 것이 아니라, 기다리는 동안 CPU를 계속 쓸지 스케줄러에 양보할지에 따라 비용 구조가 달라진다는 점**이다.
