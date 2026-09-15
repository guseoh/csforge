---
kind: concept
contentKey: operating-systems.core.isolation.cgroup
topicContentKey: operating-systems.core.isolation
slug: cgroup
title: "cgroup"
summary: "process 집합의 CPU·memory 등 resource 사용량을 제한·측정하는 경계를 설명한다."
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
  - url: "https://d2.naver.com/helloworld/7248350"
    title: "리눅스의 Control Groups 기능이 Kubernetes에 어떻게 적용되는지 살펴보기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "Kubernetes resource 설정이 실제 Linux cgroup memory 설정으로 연결되는 과정을 운영 사례로 확인한다."
    displayOrder: 2
---
# cgroup

Linux cgroup은 process들을 group으로 묶어 CPU, memory, I/O 같은 resource 사용량을 **accounting하고 제한하거나 비중을 조정하는 mechanism**이다. Namespace가 process가 보는 resource view를 분리한다면 cgroup은 process 집합이 resource를 얼마나 사용할 수 있는지를 다룬다.

### Group 단위로 resource policy를 적용한다

Process가 어느 cgroup에 속하는지에 따라 controller가 사용량을 집계하고 quota, weight, maximum 같은 policy를 적용할 수 있다. CPU controller는 실행 시간을 제한하거나 상대적인 비중을 조정할 수 있고, memory controller는 group의 memory 사용량과 pressure를 추적하며 상한을 적용할 수 있다.

구체적인 동작은 controller와 kernel 설정에 따라 다르므로 모든 resource가 동일한 방식으로 제한된다고 가정하면 안 된다.

### Limit에 도달했을 때의 결과도 resource마다 다르다

CPU quota는 runnable task가 있어도 일정 기간 throttling을 만들 수 있다. Memory pressure에서는 reclaim이 발생하고, limit을 더 이상 만족할 수 없으면 allocation failure나 OOM 처리로 이어질 수 있다. 따라서 `cgroup limit 초과 = 항상 즉시 process 종료`처럼 단순화하면 안 된다.

### Namespace와 역할이 다르다

Namespace는 PID, mount, network처럼 process가 보는 resource의 이름 공간을 분리하고, cgroup은 CPU·memory·I/O 사용량을 측정하고 제한한다. Container 환경에서는 두 mechanism이 함께 사용될 수 있지만 **visibility isolation과 resource control은 서로 다른 책임**이다.
