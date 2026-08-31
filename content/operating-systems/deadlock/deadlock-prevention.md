---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-prevention
topicContentKey: operating-systems.core.deadlock
slug: deadlock-prevention
title: "Deadlock Prevention"
summary: "Coffman 조건 하나를 설계로 깨서 deadlock을 막는 trade-off를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Deadlock Prevention

prevention은 lock order를 강제하거나, 한 번에 필요한 resource를 모두 요청하거나, timeout과 preemption으로 Coffman 조건 중 하나를 깨는 설계다. prevention은 안전을 높이는 대신 concurrency, retry, 구현 단순성을 희생할 수 있다.

전역 lock 순서는 cycle을 막지만 모든 caller가 순서를 지켜야 한다. lock을 미리 모두 잡는 방식은 hold time과 불필요한 자원 점유를 늘릴 수 있으므로 실제 workflow의 invariant와 맞춘다.

### Backend 연결

transaction 안에서 외부 API를 호출하지 않고, 필요한 DB row를 정해진 순서로 잠그며, 실패 시 보상한다. 예방 규칙을 코드 review와 integration test로 고정한다.

