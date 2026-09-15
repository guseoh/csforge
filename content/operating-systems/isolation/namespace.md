---
kind: concept
contentKey: operating-systems.core.isolation.namespace
topicContentKey: operating-systems.core.isolation
slug: namespace
title: "Namespace"
summary: "process가 보는 PID·mount·network view를 분리하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process가 resource view를 분리하는 Linux namespace와 일반 process 경계를 구분한다."
    displayOrder: 1
---
# Namespace

Linux namespace는 process가 특정 kernel resource를 **어떤 이름과 목록으로 보게 될지** 분리하는 mechanism이다. 같은 host kernel을 사용하면서도 PID, mount, network, IPC, hostname, user ID 같은 view를 서로 다르게 만들 수 있다.

![같은 host kernel 위에서 namespace별로 다른 resource view를 보는 구조](/learning/operating-systems/linux-namespace-view.svg)

### Resource를 복제하기보다 view를 분리한다

PID namespace에서는 내부 process가 별도 PID tree를 보고, mount namespace에서는 다른 mount table과 root view를 볼 수 있다. Network namespace는 interface, route와 socket namespace를 분리한다. Namespace 종류마다 대상 resource와 생성·상속 semantics가 다르므로 `namespace 하나가 container 전체를 만든다`고 설명하면 안 된다.

### Namespace는 resource 사용량을 제한하지 않는다

Process가 별도 PID나 network view를 본다고 CPU와 memory 사용량에 자동 상한이 생기는 것은 아니다. 사용할 수 있는 양은 cgroup이나 다른 resource-control mechanism의 책임이다.

또한 namespace 안에서 object가 보인다고 그 object에 모든 operation을 할 수 있는 것도 아니다. 실제 access는 permission, capability와 mount 설정 같은 별도 정책의 영향을 받는다.

Namespace의 핵심은 **같은 kernel 위에서 process마다 resource namespace와 관찰 가능한 view를 분리한다는 것**이다.
