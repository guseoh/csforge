---
kind: concept
contentKey: operating-systems.core.scheduling.multicore-affinity
topicContentKey: operating-systems.core.scheduling
slug: multicore-affinity
title: "멀티코어 친화도(Multicore Affinity)"
summary: "작업 이동을 줄여 캐시 지역성을 유지하는 이점과 CPU 부하 분산 사이의 친화도 절충을 설명한다."
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
# 멀티코어 친화도(Multicore Affinity)

여러 CPU 코어가 있는 시스템에서는 스케줄러가 **어떤 작업을 실행할지**뿐 아니라 **어느 CPU에서 실행할지**도 결정해야 한다. 최근 실행하던 CPU에서 같은 작업을 다시 실행하면 가까운 캐시에 남은 작업 집합(working set)을 재사용할 가능성이 있지만, 지역성만 지키다 보면 특정 CPU에 실행 가능한 작업이 몰리고 다른 CPU는 놀 수 있다.

이 상충 관계가 CPU 친화도(affinity)와 부하 분산(load balancing)의 핵심이다.

### 같은 CPU에 머무르면 지역성을 재사용할 수 있다

작업 A가 CPU0에서 실행하며 캐시에 명령어와 데이터를 채웠다고 하자. 다음 실행에서도 CPU0을 사용하면 일부 따뜻한 캐시 상태(warm cache)를 재사용할 수 있다. 반대로 CPU1으로 이동하면 필요한 캐시 라인을 다시 가져와야 할 수 있고 캐시 일관성 트래픽도 달라질 수 있다.

```text
CPU0: 작업 A 실행 → 작업 집합이 캐시에 남음
              │
              └─ CPU 이동
                     ↓
CPU1: 작업 A 실행 → 캐시 상태를 다시 채울 수 있음
```

![CPU 친화도가 캐시 지역성과 부하 분산 사이에서 만드는 절충](/learning/operating-systems/multicore-affinity.svg)

### 작업 이동을 막으면 부하 분산의 자유도도 줄어든다

CPU0에는 실행 가능한 작업이 많이 쌓였는데 CPU1은 유휴 상태라면 일부 작업을 옮기는 편이 전체 처리량과 대기 시간을 개선할 수 있다. 이때 지역성 일부를 잃더라도 CPU 처리 용량을 더 고르게 사용하는 이점이 생긴다.

```text
CPU0 큐: A B C D E ...
CPU1 큐: (유휴)
```

따라서 멀티프로세서 스케줄러는 캐시 친화도와 부하 분산을 함께 고려한다.

### 선호와 제한을 구분한다

스케줄러가 이전 CPU를 가능하면 다시 선택하는 것은 지역성을 위한 선호로 볼 수 있다. 반면 Linux의 `sched_setaffinity()`처럼 작업이 실행할 수 있는 CPU 집합 자체를 제한하는 것은 더 강한 제약이다.

실행 가능한 CPU 집합을 좁힐수록 작업 이동은 줄일 수 있지만 스케줄러가 과부하 CPU의 일을 유휴 CPU로 옮길 선택지도 줄어든다. NUMA 시스템에서는 CPU뿐 아니라 메모리 배치도 지역성에 영향을 줄 수 있으므로 CPU 번호 하나만으로 전체 비용을 설명할 수 없다.

멀티코어 친화도의 핵심은 **작업을 같은 CPU에 두면 지역성 이점을 얻을 수 있지만, 이동을 제한할수록 부하 분산의 자유도가 줄어든다는 절충**이다.
