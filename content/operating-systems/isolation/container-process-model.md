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
    recommendation: "process isolation과 namespace 경계를 확인한다."
    displayOrder: 1
---
# Container Process Model

일반적인 Linux container는 별도 kernel을 부팅한 virtual machine이 아니라, host kernel이 실행하는 process와 그 descendant를 namespace·cgroup·권한·root filesystem view로 묶은 실행 환경이다. image는 실행 중 process가 아니라 filesystem과 runtime을 구성하는 입력이고, container는 그 입력으로 시작한 process tree와 lifecycle의 단위다.

container를 시작하면 entrypoint가 namespace 안의 초기 process가 되고, 그 process가 보통 해당 namespace의 PID 1 역할을 한다. PID 1은 종료 signal을 적절히 전달하고 orphan child를 회수(reap)해야 하며, signal을 무시하거나 child를 방치하면 graceful shutdown과 zombie 정리가 깨질 수 있다. main process가 종료되면 container runtime이 전체 환경을 종료하므로 child가 별도 durable service처럼 계속 살아 있다고 가정하면 안 된다.

### Runtime state와 durable state를 분리한다

container restart는 process memory와 in-flight request를 자동 보존하지 않고 writable layer도 업무 데이터의 durable 저장소라는 보장이 아니다. volume, external DB, queue checkpoint와 idempotent recovery를 명시해 ephemeral runtime과 canonical state를 분리한다. namespace가 path를 격리해도 bind mount가 가리키는 host object의 lifetime과 permission은 별도 경계다.

Spring application의 graceful shutdown에서는 termination signal → 신규 작업 수락 중단 → in-flight 작업 정리 → resource close의 순서를 PID 1/entrypoint와 맞춘다. container가 사라져도 PostgreSQL source of truth와 재시도 가능한 outbox가 작업을 복구할 수 있어야 하며, orchestration 설정 자체의 세부는 Infrastructure 영역에서 다룬다.

