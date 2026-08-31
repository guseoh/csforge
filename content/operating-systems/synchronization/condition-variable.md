---
kind: concept
contentKey: operating-systems.core.synchronization.condition-variable
topicContentKey: operating-systems.core.synchronization
slug: condition-variable
title: "Condition Variable"
summary: "조건이 거짓일 때 lock을 놓고 다시 확인하는 wait/signal 흐름을 설명한다."
level: 2
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
# Condition Variable

condition variable은 어떤 predicate가 참이 될 때까지 thread가 lock을 원자적으로 놓고 sleep하도록 한다. 깨어난 뒤에는 반드시 같은 lock을 다시 얻고 predicate를 loop로 재검사해야 spurious wakeup이나 경쟁으로부터 안전하다.

signal은 대기자 하나를, broadcast는 여러 대기자를 깨울 수 있지만 깨어난 thread가 조건을 보장받는 것은 아니다. 상태 변경과 notification을 보호하는 lock의 관계가 protocol의 핵심이다.

### Backend 연결

bounded queue의 not-empty/not-full 조건을 condition variable로 표현할 수 있다. queue가 종료되는 shutdown predicate도 추가해 worker가 영원히 wait하지 않게 한다.
