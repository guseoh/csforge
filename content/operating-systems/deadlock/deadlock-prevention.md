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
  - url: "https://docs.kernel.org/5.17/locking/lockdep-design.html"
    title: "Runtime locking correctness validator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "lock acquisition order와 dependency cycle 검증 방식을 확인한다."
    displayOrder: 1
---
# Deadlock Prevention

prevention은 Coffman 조건 중 하나가 구조적으로 성립하지 않게 만드는 설계다. 전역 lock order는 circular wait를 막고, 필요한 lock을 원자적으로 모두 확보하는 방식은 hold-and-wait를 막는다. 공유 가능한 자원은 mutual exclusion이 필요 없을 수 있고, reclaim 가능한 자원에 대한 preemption은 조건을 깨는 방법이 될 수 있다. prevention은 안전을 높이는 대신 concurrency와 구현 단순성을 희생할 수 있다.

timeout은 대기를 포기하고 재시도·복구하는 failure handling일 뿐, 이미 두 thread가 서로의 lock을 기다리는 구조에서 Coffman 조건을 제거했다는 증거가 아니다. 전역 lock 순서는 모든 caller와 callback이 지켜야 하며, lock을 미리 모두 잡는 방식은 hold time과 불필요한 자원 점유를 늘릴 수 있으므로 실제 workflow의 invariant와 맞춘다.

transaction 안에서 외부 API를 호출하지 않고, 필요한 DB row를 정해진 순서로 잠그며, 실패 시 보상한다. 예방 규칙을 코드 review와 integration test로 고정한다.
