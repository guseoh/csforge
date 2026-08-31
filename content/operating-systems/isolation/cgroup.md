---
kind: concept
contentKey: operating-systems.core.isolation.cgroup
topicContentKey: operating-systems.core.isolation
slug: cgroup
title: "cgroup"
summary: "process group의 CPU·memory·I/O 자원 사용량과 limit을 관리하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/cgroups.7.html"
    title: "cgroups(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process resource limit과 container 경계를 확인한다."
    displayOrder: 1
---
# cgroup

cgroup은 process 집합을 묶어 CPU, memory, I/O와 같은 자원 사용량을 계층적으로 accounting하고 제한한다. namespace가 무엇을 보이는지의 문제라면 cgroup은 얼마나 사용할 수 있는지의 문제에 가깝다.

memory limit 초과는 reclaim, throttling, OOM kill로 나타날 수 있고 CPU quota는 runnable task가 있어도 실행을 지연시킬 수 있다. container의 limit과 JVM heap, thread pool을 같은 예산으로 맞춘다.

### Backend 연결

서비스 latency가 높을 때 host 여유 CPU가 있어도 cgroup quota에 걸릴 수 있다. container metrics에서 throttling, memory.current, OOM event를 application 지표와 함께 본다.

