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
  - url: "https://man7.org/linux/man-pages/man2/getrlimit.2.html"
    title: "getrlimit(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process별 soft/hard resource limit과 limit 초과 시 오류 경계를 확인한다."
    displayOrder: 1
---
# Resource Limit

resource limit은 process나 실행 context가 file descriptor, address space, stack, child process 수 같은 resource에 사용할 수 있는 상한을 둔다. Linux `rlimit` 모델에서는 soft limit이 현재 강제되는 값이고 hard limit이 process가 올릴 수 있는 최대 soft limit의 경계가 된다. cgroup limit, filesystem quota와는 적용 주체와 실패 의미가 다르므로 모두 `memory limit` 또는 `quota`라는 한 단어로 합치지 않는다.

상한에 도달하면 resource 종류에 따라 새 fd의 `EMFILE`, process/thread 생성 실패, memory allocation 실패, stack 확장 실패처럼 호출 지점에서 즉시 드러날 수도 있고, CPU/I/O quota처럼 throttling으로 progress가 늦어질 수도 있다. 어떤 limit은 privileged operation이나 상위 cgroup 설정에 의해 달라질 수 있으며, soft/hard limit을 높였다고 이미 사용 중인 resource가 회수되거나 leak이 고쳐지는 것은 아니다.

### Limit·quota·capacity를 구분한다

이 Topic에서 limit은 동시에 보유할 수 있는 양이나 최대 크기의 상한을, quota는 특정 subsystem이 기간·그룹·resource에 배정한 사용 budget을 가리키는 넓은 용어로 사용한다. CPU quota의 period throttling, memory cgroup의 max, disk quota와 process `rlimit`은 서로 다른 API와 failure path를 가지므로 실제 설정이 어느 subsystem 소유인지부터 확인해야 한다.

상한을 올리기 전에 leak, unbounded queue, retry 폭주, pool 반환 누락이 왜 limit까지 갔는지 확인한다. PostgreSQL connection pool, executor queue, open file, JVM heap/native memory를 독립적으로 설정하면 합계가 process와 cgroup 예산을 넘을 수 있으므로 startup에 실제 limit을 읽고 queue/rejection/timeout과 함께 안전한 상한을 계산한다.

