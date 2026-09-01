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

Linux cgroup은 process와 descendant process를 계층적인 group으로 묶어 CPU·memory·I/O 같은 resource 사용량을 accounting하고 controller별 policy를 적용하는 mechanism이다. namespace가 `무엇을 보거나 어떤 이름으로 부르는가`를 바꾼다면 cgroup은 `얼마나 사용할 수 있고 얼마나 사용했는가`를 관리한다. 하나의 process가 어느 cgroup에 속하는지가 실제 budget과 accounting 범위를 결정한다.

### 사용량이 capacity를 만나는 흐름

group에 task를 배치하면 controller가 usage를 측정하고 설정된 limit, weight 또는 quota에 따라 이후 실행을 조정한다. CPU quota에 도달하면 runnable task가 있어도 다음 period까지 throttling될 수 있고, memory pressure에서는 reclaim이 먼저 일어나거나 limit과 policy에 따라 allocation failure/OOM kill이 발생할 수 있다. I/O controller도 device request를 group 단위로 accounting하거나 bandwidth/latency 정책을 적용할 수 있지만 정확한 동작은 controller와 kernel 설정에 의존한다.

cgroup limit은 JVM heap size, native memory, thread stack, page cache까지 application이 체감하는 전체 process budget과 같지 않을 수 있다. heap을 host RAM에 맞춰 잡았는데 container의 memory cgroup이 더 작으면 native allocation이나 page cache 때문에 먼저 pressure가 생길 수 있다. 반대로 CPU usage가 낮아도 quota throttling이나 downstream I/O wait가 latency 원인일 수 있다.

서비스 latency를 분석할 때 host 평균 CPU만 보지 않고 group의 CPU throttling, memory usage/pressure, OOM event, I/O latency를 application queue와 함께 본다. cgroup은 process를 보이지 않게 만드는 namespace의 대체물이 아니며, resource limit을 설정했다고 permission이나 kernel attack surface가 사라지는 것도 아니다.

