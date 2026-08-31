---
kind: concept
contentKey: operating-systems.core.threads.process-vs-thread
topicContentKey: operating-systems.core.threads
slug: process-vs-thread
title: "Process versus Thread"
summary: "독립 주소 공간 process와 shared address space thread를 비교한다."
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
# Process versus Thread

process는 독립 address space와 resource namespace를 갖고 thread는 한 process 안에서 code·heap·open file 같은 상태를 공유한다. thread마다 register, program counter, stack은 별도로 가지므로 동시에 다른 execution path를 진행할 수 있다.

process 간 isolation은 강하지만 communication 비용이 크고, thread 간 공유는 빠르지만 race와 synchronization 책임이 커진다. “병렬성이 필요하다”와 “fault isolation이 필요하다”를 분리해 선택한다.

### Backend 연결

Spring 요청 thread가 singleton bean state를 공유하므로 mutable field는 process보다 thread 관점에서 검토해야 한다. 독립 실패 격리가 중요하면 별도 process나 서비스 경계를 고려한다.
