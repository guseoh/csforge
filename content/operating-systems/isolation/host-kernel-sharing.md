---
kind: concept
contentKey: operating-systems.core.isolation.host-kernel-sharing
topicContentKey: operating-systems.core.isolation
slug: host-kernel-sharing
title: "Host Kernel Sharing"
summary: "container가 host kernel을 공유할 때 남는 경계와 위험을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process isolation과 namespace 경계를 확인한다."
    displayOrder: 1
---
# Host Kernel Sharing

일반적인 Linux container는 process view와 resource budget을 분리해도 host kernel 위에서 system call을 수행한다. 즉 container마다 독립 kernel이 있는 것이 아니라 kernel code, syscall surface, scheduler와 일부 device 경로를 공유한다. namespace와 cgroup이 정상적으로 동작해도 kernel bug나 과도한 capability가 host까지 영향을 줄 수 있으므로 process isolation의 보안 강도는 kernel boundary에 의존한다.

VM은 guest kernel과 user process를 별도로 실행해 host와 guest 사이에 추가 virtual hardware/hypervisor 경계를 만든다. 그래서 guest kernel이 container process와 직접 공유되지 않는 더 강한 fault/security boundary를 제공할 수 있지만, memory·device virtualization과 별도 kernel 운영 비용이 생긴다. container와 VM 중 어느 것이 안전하다는 식의 일반화보다 threat model, kernel trust, performance와 운영 책임을 비교해야 한다.

### 격리 경계를 약하게 만드는 연결

`privileged` 권한, 광범위한 Linux capability, host PID/network namespace, writable host bind mount, device 전달은 container가 접근할 수 있는 resource를 넓힌다. 이때 namespace가 일부 view를 가리고 있다는 사실이 host object에 대한 접근 통제를 대신하지 않는다. 필요한 capability와 device만 허용하고 mount는 최소 범위·read-only로 설계하며, kernel과 runtime patch를 host 운영 책임에 포함한다.

로컬 Docker Compose에서도 host bind mount와 privileged 설정은 backend source나 credential에 직접 영향을 줄 수 있다. 개발 편의를 위해 연 설정을 production security boundary로 복사하지 말고, container 안 process가 실제로 어떤 kernel·mount·device 권한을 갖는지 검증한다.

