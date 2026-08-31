---
kind: concept
contentKey: operating-systems.core.race-critical-section.critical-section
topicContentKey: operating-systems.core.race-critical-section
slug: critical-section
title: "Critical Section"
summary: "공유 state 구간의 mutual exclusion·progress·bounded waiting을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Critical Section

critical section은 shared mutable state를 읽거나 바꾸는 코드 구간이다. mutual exclusion은 동시에 하나만 진입하게 하고, progress는 아무도 critical section에 없을 때 선택이 영원히 미뤄지지 않게 하며, bounded waiting은 특정 thread의 대기를 제한한다.

구간을 넓히면 correctness는 쉬워질 수 있지만 contention과 latency가 커진다. lock 밖에서 계산할 수 있는 값은 snapshot으로 만들고, lock 안에서는 invariant를 실제로 바꾸는 최소 작업만 수행한다.

### Backend 연결

in-memory queue의 enqueue/dequeue invariant를 보호하되 외부 DB 호출을 lock 안에서 기다리지 않는다. lock을 잡은 채 blocking하면 작은 pool에서 전체 throughput이 멈출 수 있다.
