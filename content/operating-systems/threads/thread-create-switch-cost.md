---
kind: concept
contentKey: operating-systems.core.threads.thread-create-switch-cost
topicContentKey: operating-systems.core.threads
slug: thread-create-switch-cost
title: "Thread Creation and Switch Cost"
summary: "생성·stack·context switch 비용이 thread 수 선택에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Thread Creation and Switch Cost

thread 하나는 stack과 scheduling metadata를 차지하고 생성·초기화 비용을 만든다. 실행 중에는 register를 저장·복원하고 shared cache와 lock 상태를 다루는 context switch 비용이 발생한다.

작업이 너무 짧으면 thread 생성 비용이 실제 작업보다 커질 수 있어 pool이나 task abstraction이 유리하다. 반대로 pool이 너무 크면 queue가 아니라 contention과 memory pressure가 병목이 된다.

### Backend 연결

executor 크기는 CPU 수, blocking 비율, task duration, downstream capacity를 함께 보고 정한다. 성능 튜닝 전에 queue wait와 active worker를 측정해 생성 비용과 처리 비용을 분리한다.
