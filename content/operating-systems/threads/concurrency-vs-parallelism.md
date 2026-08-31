---
kind: concept
contentKey: operating-systems.core.threads.concurrency-vs-parallelism
topicContentKey: operating-systems.core.threads
slug: concurrency-vs-parallelism
title: "Concurrency versus Parallelism"
summary: "겹친 진행과 실제 동시 실행을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Concurrency versus Parallelism

concurrency는 여러 작업의 진행이 시간상 겹치도록 번갈아 관리하는 구조이고 parallelism은 여러 CPU가 같은 시각에 실제로 실행하는 상태다. 한 코어에서도 concurrency는 가능하지만 parallelism에는 실행 자원이 여러 개 필요하다.

I/O-bound server는 concurrency로 대기 시간을 숨길 수 있고, CPU-bound 계산은 parallelism으로 처리량을 높일 수 있다. 공유 state를 사용하는 두 경우 모두 race 가능성은 남는다.

### Backend 연결

비동기 API가 thread를 적게 사용해도 downstream 요청은 동시 진행될 수 있다. concurrency limit과 CPU parallelism limit을 별도로 설정해 connection 폭주를 막는다.
