---
kind: concept
contentKey: operating-systems.core.isolation.resource-limit
topicContentKey: operating-systems.core.isolation
slug: resource-limit
title: "Resource Limit"
summary: "limit과 quota가 과도한 resource 사용을 실패로 바꾸는 과정을 설명한다."
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

Resource limit은 하나의 process가 사용할 수 있는 file descriptor 수, address-space 크기, stack 크기, child process 수 같은 resource에 상한을 두는 mechanism이다. Linux `rlimit` 모델에서는 **soft limit**이 현재 적용되는 상한이고, **hard limit**은 일반 process가 soft limit을 올릴 수 있는 최대 경계다.

### 상한은 무제한 사용을 명시적인 실패로 바꾼다

Open file descriptor 수가 limit에 도달하면 새 `open()`이나 socket 생성이 실패할 수 있다. Process/thread 생성 수, stack과 address-space 관련 limit도 각 operation의 실패 조건으로 작동할 수 있다.

중요한 점은 limit이 resource leak이나 overload를 고치는 것이 아니라 **더 이상 사용할 수 없는 지점을 정의한다는 것**이다. 상한을 높이면 실패 시점이 늦어질 뿐 이미 존재하는 leak이 사라지지는 않는다.

### rlimit과 cgroup은 적용 범위가 다르다

`rlimit`은 주로 process의 특정 resource 상한을 다룬다. Cgroup은 여러 process를 하나의 group으로 묶어 CPU·memory·I/O 등의 사용량을 accounting하고 제한한다. 둘 다 resource control이지만 scope와 실패 semantics가 다르다.

Filesystem quota나 CPU quota처럼 다른 subsystem의 "quota"도 각각 별도 계약을 갖는다. 따라서 실제 장애를 해석할 때는 어떤 mechanism의 어떤 limit에 도달했는지 확인해야 한다.

Resource limit의 핵심은 **resource 사용을 무한히 허용하지 않고, process가 감당할 수 있는 최대 범위를 OS 수준에서 명시적인 경계로 만드는 것**이다.
