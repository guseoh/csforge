---
kind: concept
contentKey: operating-systems.core.isolation.resource-limit
topicContentKey: operating-systems.core.isolation
slug: resource-limit
title: "Resource Limit"
summary: "process가 열 수 있는 file·memory·process 수의 상한과 실패를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man7/cgroups.7.html"
    title: "cgroups(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process resource limit과 container 경계를 확인한다."
    displayOrder: 1
---
# Resource Limit

resource limit은 process나 cgroup이 사용할 수 있는 file descriptor, address space, stack, process 수 같은 상한이다. limit 초과는 allocation 실패, syscall error, blocking, OOM kill처럼 자원 종류마다 다른 방식으로 보인다.

상한을 높이는 것만으로 해결하지 말고 leak, unbounded queue, retry 폭주가 왜 limit까지 갔는지 확인한다. soft limit과 hard limit, host limit과 container limit의 적용 순서를 구분한다.

### Backend 연결

PostgreSQL connection pool, executor queue, open file, heap을 독립적으로 설정하면 합계가 process 예산을 넘을 수 있다. startup에서 실제 limit을 읽고 안전한 상한을 계산한다.

