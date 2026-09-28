---
kind: concept
contentKey: operating-systems.core.isolation.host-kernel-sharing
topicContentKey: operating-systems.core.isolation
slug: host-kernel-sharing
title: "호스트 커널 공유(호스트 커널 Sharing)"
summary: "컨테이너가 별도 커널이 아니라 호스트 커널을 공유하는 경계를 설명한다."
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
# 호스트 커널 공유(호스트 커널 Sharing)

일반적인 Linux 컨테이너는 네임스페이스와 cgroup으로 프로세스 환경을 분리하지만 **시스템 call은 호스트 커널이 처리한다.** 컨테이너마다 독립 커널이 있는 것이 아니며 스케줄러, 메모리 management, 파일 시스템/네트워크 subsystem과 커널 코드 자체를 호스트의 다른 프로세스들과 공유한다.

![컨테이너와 VM이 호스트 커널을 대하는 경계 차이](/learning/operating-systems/호스트-커널-sharing.svg)

### 네임스페이스 분리와 커널 분리는 다르다

컨테이너 안에서 PID, mount, 네트워크 view가 다르게 보이더라도 그 view를 구현하는 커널은 동일하다. 따라서 네임스페이스는 자원 visibility를 분리할 뿐 별도의 커널 경계를 만드는 메커니즘은 아니다.

### VM과의 차이

Virtual machine은 일반적으로 guest 커널을 별도로 실행하고 hypervisor 또는 virtual 하드웨어 경계를 둔다. 컨테이너는 별도 guest 커널 없이 호스트 커널을 공유하므로 시작과 자원 overhead가 작을 수 있지만 격리 경계의 성격도 다르다.

```text
Container
processes → namespace/cgroup → host kernel

VM
guest processes → guest kernel → hypervisor → host
```

### 권한을 넓히면 공유 커널에 대한 접근 범위도 커진다

컨테이너 프로세스에 많은 capability나 장치 접근, 호스트 네임스페이스를 허용하면 커널과 호스트 자원에 접근할 수 있는 범위가 넓어진다. 구체적인 hardening 정책은 Security 영역의 책임이지만, OS 관점에서 중요한 점은 **컨테이너 격리이 호스트 커널 공유라는 전제 위에 존재한다는 것**이다.

호스트 커널 Sharing의 핵심은 컨테이너가 별도 machine이 아니라 호스트 커널을 공유하는 프로세스 격리 모델이며, 이것이 VM과 다른 중요한 경계라는 점이다.
