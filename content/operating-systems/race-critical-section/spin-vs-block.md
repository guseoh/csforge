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

### 기다리는 동안 무엇을 소비하는가

spin 방식은 lock이나 condition이 만족될 때까지 CPU에서 반복 확인한다. 기다리는 thread가 runnable 상태로 CPU를 계속 사용하므로 sleep/wakeup과 context switch 비용을 피할 수 있지만, 실제 useful work 없이 CPU cycle을 소비한다.

blocking 방식은 기다리는 실행 흐름을 sleeping/waiting 상태로 보내 CPU를 다른 runnable task에 양보한다. 대신 kernel/runtime queue 조작, sleep/wakeup과 scheduling 비용이 들어갈 수 있다.

둘의 차이는 "spin은 빠르고 block은 느리다"처럼 고정된 성능 서열이 아니라 **예상 대기시간과 scheduler 상태에 따라 어느 비용을 지불할 것인가**에 가깝다.

| 판단 기준 | Spin | Block |
| --- | --- | --- |
| 예상 wait | 매우 짧을 때 유리할 수 있음 | 길거나 불확실할수록 유리 |
| waiting 중 CPU | cycle을 계속 소비 | 보통 CPU를 다른 task에 양보 |
| owner가 preempt됨 | 불리해지기 쉬움 | 상대적으로 안전 |
| oversubscription | spinner가 contention을 키울 수 있음 | runnable pressure를 줄일 수 있음 |
| 전환 비용 | sleep/wakeup 비용을 피할 수 있음 | queue·scheduler·wakeup 비용을 지불 |

이 표는 절대 규칙이 아니라 비용 모델이다. 실제 lock 구현은 CPU topology, contention 정도, scheduler와 runtime 정책까지 고려해 adaptive strategy를 사용할 수 있다.

### 예상 wait가 매우 짧을 때 spin이 의미가 있을 수 있다

다른 CPU에서 lock owner가 몇십~몇백 cycle 안에 critical section을 끝낼 것이 확실하고 runnable CPU가 충분하다면 잠들었다 깨는 비용보다 잠깐 spin하는 쪽이 쌀 수 있다. 그래서 일부 low-level lock 구현은 짧게 spin한 뒤 block하는 adaptive 전략을 사용한다.

반대로 lock owner가 I/O를 기다리거나 preempt되어 오래 실행되지 못한다면 spinner는 CPU를 계속 태운다. oversubscribed 시스템에서는 여러 spinner가 실제 lock owner가 실행될 CPU 시간까지 빼앗을 수 있다.

### single-core와 application level에서는 판단이 달라진다

single-core에서 lock owner가 현재 실행 중이 아니고 waiter만 계속 spin한다면 owner가 CPU를 다시 받기 전까지 lock이 풀릴 수 없다. waiter가 CPU slice를 소비하는 동안에는 오히려 lock을 풀 주체의 실행 기회를 늦출 수 있다.

일반 backend application에서는 직접 busy loop를 구현하기보다 검증된 mutex, semaphore, concurrent collection 같은 primitive를 사용한다. DB/network I/O를 기다리는 동안 spin하는 것은 거의 항상 worker와 CPU를 동시에 낭비한다. low-level runtime의 spin 최적화와 application-level polling loop를 같은 것으로 보지 않는다.

### 핵심을 다시 연결하면

Spin과 block을 선택할 때는 **예상 wait 길이, lock owner가 실제로 실행 가능한지, CPU 여유와 oversubscription, sleep/wakeup 비용**을 함께 본다. 기다림이 아주 짧다는 근거가 없다면 CPU를 계속 태우는 것이 자동으로 더 빠른 선택은 아니다.
