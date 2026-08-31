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

일반적인 Linux container는 별도 kernel이 아니라 host kernel의 process를 namespace와 cgroup으로 격리하고 root filesystem·runtime을 묶는 모델이다. image는 process 자체가 아니며, container 안의 PID 1과 child lifecycle이 실제 작업을 소유한다.

container restart는 process state와 writable layer를 자동으로 업무 데이터로 보존하지 않는다. volume, external DB, queue checkpoint를 명시해 ephemeral runtime과 durable state를 분리한다.

### Backend 연결

Spring app의 graceful shutdown과 orchestrator termination grace period를 맞춘다. container가 죽어도 PostgreSQL source of truth와 재시도 가능한 outbox가 작업을 복구해야 한다.

