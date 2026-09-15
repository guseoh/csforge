---
kind: concept
contentKey: operating-systems.core.isolation.host-kernel-sharing
topicContentKey: operating-systems.core.isolation
slug: host-kernel-sharing
title: "Host Kernel Sharing"
summary: "container가 별도 kernel이 아니라 host kernel을 공유하는 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process가 resource view를 분리하는 Linux namespace와 일반 process 경계를 구분한다."
    displayOrder: 1
---
# Host Kernel Sharing

일반적인 Linux container는 namespace와 cgroup으로 process 환경을 분리하지만 **system call은 host kernel이 처리한다.** Container마다 독립 kernel이 있는 것이 아니며 scheduler, memory management, filesystem/network subsystem과 kernel code 자체를 host의 다른 process들과 공유한다.

![container와 VM이 host kernel을 대하는 경계 차이](/learning/operating-systems/host-kernel-sharing.svg)

### Namespace 분리와 kernel 분리는 다르다

Container 안에서 PID, mount, network view가 다르게 보이더라도 그 view를 구현하는 kernel은 동일하다. 따라서 namespace는 resource visibility를 분리할 뿐 별도의 kernel boundary를 만드는 mechanism은 아니다.

### VM과의 차이

Virtual machine은 일반적으로 guest kernel을 별도로 실행하고 hypervisor 또는 virtual hardware 경계를 둔다. Container는 별도 guest kernel 없이 host kernel을 공유하므로 시작과 resource overhead가 작을 수 있지만 isolation boundary의 성격도 다르다.

```text
Container
processes → namespace/cgroup → host kernel

VM
guest processes → guest kernel → hypervisor → host
```

### 권한을 넓히면 공유 kernel에 대한 접근 범위도 커진다

Container process에 많은 capability나 device access, host namespace를 허용하면 kernel과 host resource에 접근할 수 있는 범위가 넓어진다. 구체적인 hardening 정책은 Security 영역의 책임이지만, OS 관점에서 중요한 점은 **container isolation이 host kernel 공유라는 전제 위에 존재한다는 것**이다.

Host Kernel Sharing의 핵심은 container가 별도 machine이 아니라 host kernel을 공유하는 process isolation 모델이며, 이것이 VM과 다른 중요한 경계라는 점이다.
