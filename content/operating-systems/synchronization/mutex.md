---
kind: concept
contentKey: operating-systems.core.synchronization.mutex
topicContentKey: operating-systems.core.synchronization
slug: mutex
title: "Mutex"
summary: "소유자가 한 번에 하나인 mutual exclusion과 unlock 책임을 설명한다."
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
# Mutex

mutex는 한 시점에 하나의 thread만 critical section에 들어가게 하는 ownership 기반 primitive다. lock을 얻은 thread가 protected state를 바꾸고 반드시 unlock해야 하며, 예외 경로에서도 unlock이 빠지지 않도록 구조화한다.

mutex는 visibility와 mutual exclusion을 제공하지만 lock 순서가 꼬이면 deadlock이 생긴다. lock을 오래 보유하지 않고 재진입 가능 여부와 timeout semantics를 명확히 한다.

### Backend 연결

JVM synchronized block과 `Lock` 모두 보호 범위와 해제 책임을 코드로 드러낸다. transaction이나 distributed lock이 필요한 문제를 process-local mutex로 해결할 수 있다고 가정하지 않는다.
