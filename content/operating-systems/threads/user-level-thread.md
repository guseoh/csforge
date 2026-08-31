---
kind: concept
contentKey: operating-systems.core.threads.user-level-thread
topicContentKey: operating-systems.core.threads
slug: user-level-thread
title: "User-Level Thread"
summary: "user runtime이 scheduling하는 thread의 빠른 전환과 blocking 한계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# User-Level Thread

user-level thread나 coroutine은 runtime이 scheduling과 context 저장을 관리한다. 생성·전환이 kernel thread보다 가벼울 수 있고 많은 논리 작업을 적은 carrier에 multiplex할 수 있다.

runtime이 blocking syscall을 알지 못하면 하나의 carrier가 막혀 여러 logical task가 함께 진행하지 못할 수 있다. 따라서 non-blocking API, parking instrumentation, carrier pinning 정책을 구현과 함께 확인한다.

### Backend 연결

비동기 server의 task 수와 실제 OS thread 수를 같은 값으로 보지 않는다. callback·future·virtual thread가 어떤 blocking 경계를 갖는지 부하 테스트로 검증한다.
