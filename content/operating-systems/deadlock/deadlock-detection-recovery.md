---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-detection-recovery
topicContentKey: operating-systems.core.deadlock
slug: deadlock-detection-recovery
title: "Detection and Recovery"
summary: "deadlock 탐지 뒤 victim 선택·rollback·resource 회수의 비용을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Detection and Recovery

탐지는 wait-for graph의 cycle이나 timeout·progress 지표로 stuck 상태를 찾는다. recovery는 victim 작업을 abort하거나 lock을 회수하고, 이미 외부에 반영된 side effect를 보상하는 비용을 부담한다.

victim 선택은 작업 중요도, rollback 가능성, 이미 소비한 자원과 재시작 비용을 고려한다. lock을 강제로 빼앗는 것은 invariant를 깨뜨릴 수 있어 transaction abort나 process restart처럼 경계를 명확히 한다.

### Backend 연결

오래된 import job을 cancel할 때 DB transaction rollback과 이미 발행된 event를 구분한다. recovery 완료 전에는 같은 작업을 자동 재시작하지 않고 상태를 operator가 확인할 수 있게 한다.

