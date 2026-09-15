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
  - url: "https://man7.org/linux/man-pages/man2/sched_setaffinity.2.html"
    title: "sched_setaffinity(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux에서 thread affinity mask가 실행 가능한 CPU 집합을 제한하고 migration에 어떤 영향을 주는지 확인한다."
    displayOrder: 2
---
# Multicore Affinity

여러 CPU core가 있는 시스템에서는 scheduler가 **어떤 task를 실행할지**뿐 아니라 **어느 CPU에서 실행할지**도 결정해야 한다. 최근 실행하던 CPU에서 같은 task를 다시 실행하면 가까운 cache에 남은 working set을 재사용할 가능성이 있지만, locality만 지키다 보면 특정 CPU에 runnable task가 몰리고 다른 CPU는 놀 수 있다.

이 상충 관계가 CPU affinity와 load balancing의 핵심이다.

### 같은 CPU에 머무르면 locality를 재사용할 수 있다

Task A가 CPU0에서 실행하며 cache에 instruction과 data를 채웠다고 하자. 다음 실행에서도 CPU0을 사용하면 일부 warm cache state를 재사용할 수 있다. 반대로 CPU1으로 이동하면 필요한 line을 다시 가져와야 할 수 있고 coherence traffic도 달라질 수 있다.

```text
CPU0: Task A 실행 → working set warm
              │
              └─ migration
                     ↓
CPU1: Task A 실행 → cache state를 다시 채울 수 있음
```

![CPU affinity가 cache locality와 load balancing 사이에서 만드는 trade-off](/learning/operating-systems/multicore-affinity.svg)

### Migration을 막으면 load balancing 자유도도 줄어든다

CPU0에는 runnable task가 많이 쌓였는데 CPU1은 idle하다면 일부 task를 옮기는 편이 전체 처리량과 대기 시간을 개선할 수 있다. 이때 locality 일부를 잃더라도 CPU capacity를 더 고르게 사용하는 이점이 생긴다.

```text
CPU0 queue: A B C D E ...
CPU1 queue: (idle)
```

따라서 multiprocessor scheduler는 cache affinity와 load balance를 함께 고려한다.

### 선호와 제한을 구분한다

Scheduler가 이전 CPU를 가능하면 다시 선택하는 것은 locality를 위한 선호로 볼 수 있다. 반면 Linux의 `sched_setaffinity()`처럼 task가 실행할 수 있는 CPU 집합 자체를 제한하는 것은 더 강한 제약이다.

실행 가능한 CPU 집합을 좁힐수록 migration은 줄일 수 있지만 scheduler가 과부하 CPU의 일을 idle CPU로 옮길 선택지도 줄어든다. NUMA 시스템에서는 CPU뿐 아니라 memory placement도 locality에 영향을 줄 수 있으므로 CPU 번호 하나만으로 전체 비용을 설명할 수 없다.

Multicore Affinity의 핵심은 **task를 같은 CPU에 두면 locality 이점을 얻을 수 있지만, migration을 제한할수록 load balancing의 자유도가 줄어든다는 trade-off**다.