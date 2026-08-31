---
kind: concept
contentKey: operating-systems.core.threads.thread-private-state
topicContentKey: operating-systems.core.threads
slug: thread-private-state
title: "Thread-Private State"
summary: "stack·register·PC를 thread별로 분리해야 하는 이유를 설명한다."
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
# Thread-Private State

각 thread는 현재 instruction을 가리키는 PC, register 집합, 호출 frame을 담는 private stack을 가져야 독립적인 실행 흐름이 된다. 같은 heap을 공유하더라도 한 thread의 local variable은 다른 thread의 호출 frame과 섞이지 않는다.

thread-local state는 공유 동기화를 줄이지만 context와 stack memory가 늘어난다. thread-local에 request나 security state를 둘 때 thread pool 재사용으로 이전 작업 값이 누수되지 않도록 정리한다.

### Backend 연결

logging context와 transaction context를 thread-local에 둘 경우 async 전환에서 자동 전파된다고 가정하지 않는다. 명시적인 context carrier와 clear 경계를 사용한다.
