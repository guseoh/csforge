---
kind: concept
contentKey: operating-systems.core.scheduling.multicore-affinity
topicContentKey: operating-systems.core.scheduling
slug: multicore-affinity
title: "Multicore Affinity"
summary: "task migration을 줄이는 cache locality와 CPU load balance 사이의 affinity trade-off를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/10-cpu-sched-multi.pdf"
    title: "OSTEP Korean: Multiprocessor Scheduling"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "multiprocessor scheduling에서 cache affinity와 load balancing이 충돌하는 이유를 확인한다."
    displayOrder: 1
---
# Multicore Affinity

Single-core scheduling에서는 “다음에 어떤 task를 실행할 것인가”가 핵심이었다. 여러 CPU/core가 있는 시스템에서는 여기에 **어느 CPU에서 실행할 것인가**가 추가된다. Task를 이전에 실행하던 CPU에 계속 두면 cache locality를 재사용할 수 있지만, 모든 task를 한 CPU에 붙잡아 두면 다른 CPU가 놀 수 있다.

이 trade-off를 이해하기 위한 개념이 CPU affinity다. Affinity는 task가 특정 CPU나 CPU 집합에서 실행되도록 선호하거나 제한하는 정책을 의미한다.

### Migration에는 locality 비용이 생길 수 있다

Task A가 CPU0에서 실행하면서 instruction/data working set을 CPU0 가까운 cache hierarchy에 만들었다고 하자. 다음 실행에서 CPU1으로 이동하면 동일한 cache state를 그대로 사용할 수 없을 수 있어 cache miss와 coherence traffic이 증가할 수 있다.

```text
CPU0: Task A 실행 → A working set cache warm
              │
              └─ migration
                     ↓
CPU1: Task A 실행 → 필요한 data를 다시 가져올 수 있음
```

그래서 scheduler가 가능하면 이전 CPU를 선호하는 affinity를 두면 locality 이점이 있을 수 있다.

### 너무 강한 affinity는 load imbalance를 만든다

반대로 CPU0에 runnable task가 20개 몰렸는데 CPU1은 idle하다고 하자. Cache locality만 지키겠다고 task를 CPU0에 계속 묶어 두면 system-wide throughput과 latency가 나빠진다.

```text
CPU0 queue: A B C D E ...  (busy)
CPU1 queue:               (idle)
```

이때 일부 task를 migration시키면 locality 일부를 잃더라도 overall CPU utilization과 response를 개선할 수 있다. Multiprocessor scheduler는 **cache affinity와 load balancing을 동시에 고려**해야 한다.

### Affinity hint와 hard pinning을 구분한다

Scheduler가 최근 실행 CPU를 선호하는 soft affinity와, `sched_setaffinity`/container cpuset 같은 mechanism으로 task 실행 CPU를 제한하는 hard affinity는 의미가 다르다.

Hard pinning을 잘못 사용하면 available CPU capacity를 스스로 줄일 수 있다. 예를 들어 8-core host에서 CPU0 하나에 latency-sensitive worker 20개를 모두 pin하면 나머지 core가 있어도 그 task들은 CPU0만 경쟁한다.

### NUMA에서는 memory locality까지 연결된다

NUMA system에서는 CPU가 어느 memory node에 접근하느냐에 따라 latency/bandwidth 특성이 달라질 수 있다. Task CPU affinity만 바꾸고 memory placement를 무시하면 원하는 locality 효과가 나오지 않을 수 있다.

따라서 NUMA tuning은 단순 `CPU 번호 고정`이 아니라 CPU placement, memory placement, device locality까지 실제 topology에 맞춰 측정해야 한다.

### JVM/Container 환경에서 함부로 pinning하지 않는다

JVM에는 application worker 외에도 GC, JIT, runtime/native threads가 존재할 수 있다. Container는 CPU quota/cpuset으로 보이는 capacity가 host 전체 CPU와 다를 수 있다.

그래서 backend latency가 나쁘다는 이유만으로 worker를 특정 CPU에 pin하는 것은 좋은 기본 해법이 아니다. 먼저 다음을 측정한다.

- CPU별 utilization/run queue
- task migration
- cache miss/locality 지표
- container CPU quota/throttling
- NUMA topology와 memory placement
- p95/p99 latency 변화

Multicore Affinity의 핵심은 **task를 같은 CPU에 두면 locality가 좋아질 수 있지만, migration을 막을수록 load balancing 자유도가 줄어든다는 상충 관계**를 이해하는 것이다.
