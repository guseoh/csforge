---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock
topicContentKey: operating-systems.core.deadlock
slug: deadlock
title: "Deadlock"
summary: "서로 기다려 영원히 진행하지 못하는 상태를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Deadlock

deadlock은 각 process나 thread가 자원을 보유한 채 다른 자원을 기다리고, 기다림이 cycle을 이루어 누구도 진행하지 못하는 상태다. 단순히 느린 대기나 queue backlog와 달리 자원 획득 순서가 서로를 막는다.

lock timeout은 deadlock을 감지하거나 완화할 수 있지만, timeout 뒤 상태 rollback과 partial effect 처리가 필요하다. 원인을 숨기려고 무조건 retry하면 contention과 중복 작업을 악화시킨다.

### Backend 연결

DB transaction, application lock, 외부 API callback을 한 workflow에서 중첩하지 않는다. lock order와 timeout, 보상 작업을 문서화해 장애 시 stuck request를 회수한다.

