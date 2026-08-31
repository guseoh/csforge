---
kind: concept
contentKey: operating-systems.core.race-critical-section.race-condition
topicContentKey: operating-systems.core.race-critical-section
slug: race-condition
title: "Race Condition"
summary: "결과가 실행 순서에 의존하는 race condition의 필요 조건을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Race Condition

race condition은 여러 execution order가 가능하고 그중 일부에서 결과가 달라지는 상태다. 같은 memory에 접근한다는 것만으로는 부족하며, 최소 하나의 write와 적절한 ordering 또는 mutual exclusion 부재가 함께 있어야 한다.

data race는 memory model 관점의 동기화 위반이고, 넓은 race condition은 file·message·외부 resource 순서 문제까지 포함할 수 있다. 원인을 lock 하나 추가로 가리기보다 invariant와 happens-before를 설명한다.

### Backend 연결

중복 import, 중복 review 제출, cache stampede는 모두 요청 순서가 결과에 영향을 줄 수 있는 사례다. DB constraint와 idempotency key를 application lock의 유일한 대안으로 취급하지 않는다.
