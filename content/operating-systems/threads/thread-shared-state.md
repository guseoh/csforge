---
kind: concept
contentKey: operating-systems.core.threads.thread-shared-state
topicContentKey: operating-systems.core.threads
slug: thread-shared-state
title: "Thread-Shared State"
summary: "code·heap·file descriptor 공유가 communication과 race를 만드는 이유를 설명한다."
level: 1
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
# Thread-Shared State

같은 process의 thread는 heap과 전역 데이터, open file descriptor를 공유해 별도 message copy 없이 통신할 수 있다. 그러나 두 thread가 같은 mutable value를 동시에 읽고 쓰면 interleaving에 따라 결과가 달라진다.

공유 state의 owner, 읽기·쓰기 lock, visibility와 lifecycle을 명시해야 한다. 공유를 줄이고 immutable value나 message passing을 사용하면 lock 범위를 줄일 수 있지만 copy와 queue 비용이 생긴다.

### Backend 연결

singleton cache나 in-memory counter를 여러 request thread가 변경할 때 atomicity와 visibility를 별도 검토한다. DB transaction이 있다고 JVM heap의 race가 자동으로 해결되는 것은 아니다.
