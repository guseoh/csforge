---
kind: concept
contentKey: operating-systems.core.threads.kernel-thread
topicContentKey: operating-systems.core.threads
slug: kernel-thread
title: "Kernel Thread"
summary: "kernel scheduler가 인식하는 thread와 blocking의 관계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Kernel Thread

kernel이 인식하는 thread는 scheduler의 runnable 단위가 될 수 있고, 한 thread의 blocking이 같은 process의 모든 thread를 반드시 막지는 않는다. kernel은 각 thread의 register와 scheduling state를 따로 관리한다.

대신 thread 수가 늘면 stack, scheduling metadata, context switch와 shared lock contention이 늘어난다. “동시에 실행할 수 있다”와 “무한히 생성해도 된다”는 다른 주장이다.

### Backend 연결

platform thread 기반 executor는 blocking 작업을 수용하지만 worker 상한이 필요하다. blocking 호출을 별도 executor로 분리해 CPU-bound pool이 고갈되지 않게 한다.
