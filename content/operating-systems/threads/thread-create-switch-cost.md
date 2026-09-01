---
kind: concept
contentKey: operating-systems.core.threads.thread-create-switch-cost
topicContentKey: operating-systems.core.threads
slug: thread-create-switch-cost
title: "Thread Creation and Switch Cost"
summary: "thread의 stack·metadata·creation·scheduling 비용이 workload 선택에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Thread Creation and Switch Cost

### thread 하나에도 상태가 필요하다

thread를 만들면 최소한 실행 context와 stack, runtime/OS가 추적할 metadata가 필요하다. platform/kernel-visible thread라면 scheduler가 관리할 task state와 native stack도 비용에 들어간다. 따라서 `thread는 process보다 가볍다`는 말은 상대적인 비교이지 비용이 0이라는 뜻이 아니다.

작업 하나마다 platform thread를 새로 만들고 바로 버리면 create/start/teardown 비용이 실제 작업보다 커질 수 있다. thread pool은 이 생성 비용을 여러 task에 나누기 위한 대표적인 방법이다.

### context switch 비용은 저장·복원만이 아니다

CPU register를 저장하고 다른 thread context를 복원하는 직접 비용 외에도 cache locality, TLB와 branch predictor 상태, shared lock contention 같은 간접 비용이 성능에 영향을 줄 수 있다. 같은 process의 thread 전환이 서로 다른 process 전환보다 일부 address-space 비용이 작을 수 있어도 `전환은 공짜`가 아니다.

예를 들어 4-core CPU에서 CPU-bound runnable thread를 4개에서 400개로 늘리면 실제 CPU parallelism은 4를 넘지 않는다. 그 대신 runnable queue와 switch 빈도가 증가할 수 있다.

### 측정할 때 생성 비용과 queue 비용을 나눈다

thread 수를 줄였더니 latency가 나빠졌다고 해서 곧바로 thread creation이 병목이었다고 결론내리면 안 된다. active worker, queue wait, task execution time, context switch, memory usage를 따로 봐야 한다. pool이 작아 queue가 길어진 것과 pool이 커서 scheduling contention이 커진 것은 반대 방향의 문제다.

Backend executor의 크기도 CPU 수 하나로 정하지 않는다. CPU-bound인지, blocking 시간이 얼마나 되는지, DB connection 같은 downstream capacity가 얼마인지까지 함께 봐야 한다.
