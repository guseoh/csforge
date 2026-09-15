---
kind: concept
contentKey: operating-systems.core.isolation.container-process-model
topicContentKey: operating-systems.core.isolation
slug: container-process-model
title: "Container Process Model"
summary: "container가 isolated process environment라는 모델을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process가 resource view를 분리하는 Linux namespace와 일반 process 경계를 구분한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/3661677"
    title: "Docker 기반 분산 트랜스코더 개발"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "Docker를 실제 process workload 배포 경계로 사용하면서 host OS 의존성과 resource 배치를 고려한 사례를 확인한다."
    displayOrder: 2
---
# Container Process Model

일반적인 Linux container는 별도의 guest kernel을 부팅한 virtual machine이 아니다. Host kernel 위에서 실행되는 process와 process tree에 namespace, cgroup, permission, filesystem view 같은 OS mechanism을 조합해 **독립된 실행 환경처럼 보이게 만든 것**이다.

![host kernel 위 process tree와 namespace/cgroup으로 구성되는 container](/learning/operating-systems/container-process-model.svg)

### Container의 중심에는 process가 있다

Container를 시작하면 entrypoint process가 실행되고 그 아래 child process가 만들어질 수 있다. Container runtime은 이 process tree의 lifecycle과 namespace/cgroup 구성을 관리한다. Image는 실행 중인 process가 아니라 filesystem과 실행 환경을 구성하기 위한 입력이다.

### 격리는 여러 OS primitive의 조합이다

Namespace는 PID·mount·network 같은 view를 분리하고, cgroup은 CPU·memory 같은 resource 사용을 관리한다. Permission과 capability는 어떤 privileged operation을 할 수 있는지 제한한다. Container라는 하나의 이름 뒤에서 서로 다른 OS mechanism이 각각 다른 책임을 가진다.

### Container 종료는 process lifecycle과 연결된다

Container의 main process가 종료되면 container lifecycle도 종료되는 것이 일반적이다. 따라서 container를 "항상 살아 있는 작은 machine"보다 **격리된 process environment와 그 lifecycle**로 이해하는 것이 정확하다.

Container process model의 핵심은 별도 kernel을 가진 VM이 아니라 **host kernel 위의 process들을 여러 isolation/resource-control primitive로 묶은 실행 단위**라는 것이다.
