---
kind: concept
contentKey: operating-systems.core.isolation.container-process-model
topicContentKey: operating-systems.core.isolation
slug: container-process-model
title: "Container Process Model"
summary: "container가 host kernel 위의 process와 namespace·cgroup으로 구성되는 방식을 설명한다."
level: 2
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

일반적인 Linux container는 별도 kernel을 부팅한 virtual machine이 아니라, host kernel이 실행하는 process와 그 descendant를 namespace·cgroup·권한·root filesystem view로 묶은 실행 환경이다. image는 실행 중 process가 아니라 filesystem과 runtime을 구성하는 입력이고, container는 그 입력으로 시작한 process tree와 lifecycle의 단위다.

![host kernel 위 process tree와 namespace/cgroup으로 구성되는 container](/learning/operating-systems/container-process-model.svg)

container를 시작하면 entrypoint가 namespace 안의 초기 process가 되고, 그 process가 보통 해당 namespace의 PID 1 역할을 한다. PID 1은 종료 signal을 적절히 전달하고 orphan child를 회수(reap)해야 하며, signal을 무시하거나 child를 방치하면 graceful shutdown과 zombie 정리가 깨질 수 있다. main process가 종료되면 container runtime이 전체 환경을 종료하므로 child가 별도 durable service처럼 계속 살아 있다고 가정하면 안 된다.

### Runtime state와 durable state를 분리한다

container restart는 process memory와 in-flight request를 자동 보존하지 않고 writable layer도 업무 데이터의 durable 저장소라는 보장이 아니다. volume, external DB, queue checkpoint와 idempotent recovery를 명시해 ephemeral runtime과 canonical state를 분리한다. namespace가 path를 격리해도 bind mount가 가리키는 host object의 lifetime과 permission은 별도 경계다.

Spring application의 graceful shutdown에서는 termination signal → 신규 작업 수락 중단 → in-flight 작업 정리 → resource close의 순서를 PID 1/entrypoint와 맞춘다. 중요한 상태는 process memory 밖의 durable storage에 남겨야 하며, 작업의 전달·재처리 보장이 필요하다면 idempotent retry, durable queue, transactional handoff 같은 복구 경계를 실제 요구사항에 맞게 선택한다. orchestration 설정 자체의 세부는 Infrastructure 영역에서 다룬다.

### 면접에서 이렇게 나옵니다

#### Q. Container를 작은 VM이라고 설명하면 왜 부정확한가요?

일반적인 Linux container는 별도 guest kernel을 부팅하는 VM이 아니라 host kernel 위의 process에 namespace·cgroup·filesystem view 등을 적용한 실행 환경입니다. 별도 kernel 경계가 없다는 점이 VM과의 중요한 차이입니다.
