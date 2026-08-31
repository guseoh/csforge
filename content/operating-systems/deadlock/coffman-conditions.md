---
kind: concept
contentKey: operating-systems.core.deadlock.coffman-conditions
topicContentKey: operating-systems.core.deadlock
slug: coffman-conditions
title: "Coffman Conditions"
summary: "deadlock의 네 필요 조건을 연결한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Coffman Conditions

deadlock의 필요 조건은 mutual exclusion, hold and wait, no preemption, circular wait다. 네 조건이 동시에 존재할 때 cycle이 실제로 생길 수 있으므로 설계에서 하나를 깨면 deadlock 가능성을 낮출 수 있다.

모든 lock이 같은 종류의 resource인 것처럼 생각하면 조건을 놓친다. DB row lock과 application mutex처럼 서로 다른 resource를 한 요청이 순서 없이 보유하는 경우에도 wait graph를 그려야 한다.

### Backend 연결

여러 repository 호출과 cache lock이 섞인 service는 고정된 lock order를 사용한다. 대기 graph에 외부 network call까지 넣을 수 있다면 timeout과 compensation을 함께 설계한다.

