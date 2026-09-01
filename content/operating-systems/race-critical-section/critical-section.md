---
kind: concept
contentKey: operating-systems.core.race-critical-section.critical-section
topicContentKey: operating-systems.core.race-critical-section
slug: critical-section
title: "Critical Section"
summary: "shared invariant를 보호하는 critical section과 mutual exclusion·progress·bounded waiting 요구를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Critical Section

### critical section은 단순히 `lock 안쪽 코드`라는 이름이 아니다

critical section은 shared state의 invariant를 깨지 않도록 concurrent execution을 제한해야 하는 코드 구간이다. 어떤 lock primitive를 사용할지는 구현 선택이고, 먼저 `어느 operation들이 동시에 실행되면 안 되는가`를 찾아야 한다.

예를 들어 bounded queue에서 `tail index 증가`와 `element 저장`이 하나의 enqueue invariant를 이룬다면 둘을 서로 다른 보호 규칙으로 다루면 중간 state가 다른 thread에 노출될 수 있다.

### 세 가지 고전적 요구를 구분한다

**Mutual exclusion**은 한 thread가 critical section에 있을 때 다른 competing thread가 동시에 그 구간을 실행하지 못하게 한다. **Progress**는 critical section이 비어 있고 진입하려는 thread가 있을 때 선택이 무기한 미뤄지지 않아야 한다는 요구다. **Bounded waiting**은 특정 thread가 다른 thread들에게 계속 추월당하며 무한히 기다리지 않도록 waiting에 상한 성질을 요구한다.

mutex 하나를 사용한다고 세 요구가 모든 상황에서 자동으로 완벽히 보장되는 것은 아니다. 실제 fairness와 scheduling 정책은 primitive 구현에 따라 달라질 수 있다.

### critical section은 필요한 만큼만 유지한다

lock 안에서 CPU 계산, logging, DB/network I/O까지 모두 수행하면 correctness는 단순해 보일 수 있지만 contention이 급격히 커진다. 특히 lock을 잡고 blocking I/O를 기다리면 다른 thread가 shared state를 사용할 수 없어 작은 지연이 전체 queue latency로 전파될 수 있다.

가능하면 lock 밖에서 준비할 수 있는 계산은 먼저 수행하고, lock 안에서는 shared invariant를 확인·변경하는 최소 state transition만 수행한다. 다만 lock 밖으로 옮긴 계산이 stale snapshot을 사용해 correctness를 깨지 않는지 반드시 확인해야 한다.
