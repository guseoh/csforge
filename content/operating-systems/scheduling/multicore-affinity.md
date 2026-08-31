---
kind: concept
contentKey: operating-systems.core.scheduling.multicore-affinity
topicContentKey: operating-systems.core.scheduling
slug: multicore-affinity
title: "Multicore Affinity"
summary: "CPU affinity가 cache locality와 load balance에 미치는 trade-off를 추론한다."
level: 3
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://man7.org/linux/man-pages/man7/sched.7.html"
    title: "sched(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "scheduler 정책과 context 전환 비용을 확인한다."
    displayOrder: 1
---
# Multicore Affinity

CPU affinity는 thread나 process가 실행될 CPU 집합을 제한한다. 같은 CPU에 계속 실행하면 cache locality가 좋아질 수 있지만, 한 CPU에 runnable task가 몰리면 다른 CPU가 놀면서 load balance가 악화된다.

NUMA 시스템에서는 CPU와 memory node의 거리도 affinity 판단에 들어간다. affinity를 고정하기 전에 실제 cache miss, migration, queue length를 측정하고, 장애 시 정책을 되돌릴 수 있게 한다.

### Backend 연결

JVM worker를 특정 CPU에 고정하는 것은 latency를 자동으로 낮추지 않는다. GC, native thread, container CPU quota와 함께 관찰하고 운영 환경에서 재현 가능한 benchmark로 판단한다.

