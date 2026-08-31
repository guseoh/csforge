---
kind: concept
contentKey: operating-systems.core.isolation.process-isolation
topicContentKey: operating-systems.core.isolation
slug: process-isolation
title: "Process Isolation"
summary: "process 주소 공간과 자원 경계가 fault 전파를 줄이는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process isolation과 namespace 경계를 확인한다."
    displayOrder: 1
---
# Process Isolation

process isolation은 서로 다른 process의 virtual address space와 권한을 분리해 한 process의 잘못된 memory access가 다른 process를 직접 덮지 못하게 한다. IPC와 kernel mediation을 통해서만 명시적으로 상태를 교환한다.

isolation은 절대적인 보안 경계가 아니며 shared kernel, file permission, shared device와 side channel이 남는다. process crash가 부모·child·외부 DB에 미친 effect를 별도로 recovery해야 한다.

### Backend 연결

worker process를 분리해 JVM crash나 native library fault의 영향 범위를 줄일 수 있다. queue와 canonical DB를 경계로 두고 process 재시작 시 중복 작업을 처리한다.

