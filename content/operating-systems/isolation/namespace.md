---
kind: concept
contentKey: operating-systems.core.isolation.namespace
topicContentKey: operating-systems.core.isolation
slug: namespace
title: "Namespace"
summary: "process가 보게 되는 PID·network·mount 등의 이름 공간을 분리하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process isolation과 namespace 경계를 확인한다."
    displayOrder: 1
---
# Namespace

Linux namespace는 process가 특정 kernel resource의 이름과 목록을 **어떻게 보느냐**를 분리하는 mechanism이다. process를 namespace에 넣으면 같은 host kernel 위에서도 PID 목록, mount table, network interface, IPC object, user ID view 등이 다른 process와 달라질 수 있다. 이는 resource를 복제하는 것보다 process가 관찰하고 이름 붙이는 context를 virtualize하는 데 가깝다.

### View가 만들어지는 흐름

새 namespace를 만들거나 process를 다른 namespace에 배치하면 해당 process가 system call로 조회하는 view와 이름 lookup의 대상이 바뀐다. PID namespace의 process는 내부에서 별도 PID 1과 process tree를 볼 수 있지만 host 쪽 ancestor는 그 process를 다른 PID로 볼 수 있다. mount namespace는 mount table과 root view를 분리하고, network namespace는 interface·route·socket namespace를 분리한다. namespace 종류마다 분리되는 resource와 상속/생성 semantics가 다르므로 `container = 하나의 namespace`라고 일반화하면 안 된다.

namespace는 visibility와 naming을 바꾸지만 CPU·memory 사용량을 자동으로 제한하지 않는다. 또한 process가 접근할 수 있는 실제 file이 writable bind mount로 연결되거나 과도한 capability가 주어지면 view 분리만으로 host resource 보호가 완성되지 않는다. cgroup은 capacity/accounting, permission은 object access, capability는 privileged operation의 별도 경계이므로 함께 확인해야 한다.

### Backend에서 생기는 관찰 차이

Docker 안에서 `localhost`, filesystem path, hostname과 PID는 host에서 관찰하는 값과 다를 수 있다. 예를 들어 container의 `localhost`는 host가 아니라 그 network namespace의 loopback이고, container process가 보는 `/`도 mount namespace가 구성한 root view일 수 있다. 설정이나 장애 로그를 해석할 때 process가 속한 namespace와 실제 host endpoint/mount를 함께 확인한다.

