---
kind: concept
contentKey: operating-systems.core.isolation.namespace
topicContentKey: operating-systems.core.isolation
slug: namespace
title: "네임스페이스(네임스페이스)"
summary: "프로세스가 보는 PID·mount·네트워크 view를 분리하는 방식을 설명한다."
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
# 네임스페이스(네임스페이스)

Linux 네임스페이스는 프로세스가 특정 커널 자원를 **어떤 이름과 목록으로 보게 될지** 분리하는 메커니즘이다. 같은 호스트 커널을 사용하면서도 PID, mount, 네트워크, IPC, hostname, 사용자 ID 같은 view를 서로 다르게 만들 수 있다.

![같은 호스트 커널 위에서 네임스페이스별로 다른 자원 view를 보는 구조](/learning/operating-systems/linux-네임스페이스-view.svg)

### 자원를 복제하기보다 view를 분리한다

PID 네임스페이스에서는 내부 프로세스가 별도 PID tree를 보고, mount 네임스페이스에서는 다른 mount table과 root view를 볼 수 있다. 네트워크 네임스페이스는 interface, route와 socket 네임스페이스를 분리한다. 네임스페이스 종류마다 대상 자원와 생성·상속 의미가 다르므로 `namespace 하나가 container 전체를 만든다`고 설명하면 안 된다.

### 네임스페이스는 자원 사용량을 제한하지 않는다

프로세스가 별도 PID나 네트워크 view를 본다고 CPU와 메모리 사용량에 자동 상한이 생기는 것은 아니다. 사용할 수 있는 양은 cgroup이나 다른 자원-control 메커니즘의 책임이다.

또한 네임스페이스 안에서 객체가 보인다고 그 객체에 모든 연산을 할 수 있는 것도 아니다. 실제 접근는 권한, capability와 mount 설정 같은 별도 정책의 영향을 받는다.

네임스페이스의 핵심은 **같은 커널 위에서 프로세스마다 자원 네임스페이스와 관찰 가능한 view를 분리한다는 것**이다.
