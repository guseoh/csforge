---
kind: concept
contentKey: operating-systems.core.threads.thread-create-switch-cost
topicContentKey: operating-systems.core.threads
slug: thread-create-switch-cost
title: "Thread Creation·Switch Cost"
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
# Thread Creation·Switch Cost

### thread 하나에도 상태가 필요하다

thread를 만들면 최소한 실행 context와 stack, runtime/OS가 추적할 metadata가 필요하다. platform/kernel-visible thread라면 scheduler가 관리할 task state와 native stack도 비용에 들어간다. 따라서 `thread는 process보다 가볍다`는 말은 상대적인 비교이지 비용이 0이라는 뜻이 아니다.

작업 하나마다 platform thread를 새로 만들고 바로 버리면 create/start/teardown 비용이 실제 작업보다 커질 수 있다. thread pool은 이 생성 비용을 여러 task에 나누기 위한 대표적인 방법이다.

### context switch 비용을 한 종류로 뭉치지 않는다

Thread를 전환할 때는 현재 execution context를 보존하고 다음 runnable thread의 context를 복원하며 scheduler가 실행 대상을 바꾸는 직접 비용이 든다. 여기에 workload와 CPU 상태에 따라 cache locality나 branch-predictor history가 덜 유리해지는 **간접적인 microarchitecture 효과**가 뒤따를 수 있다.

TLB 영향은 특히 구분해서 봐야 한다. 같은 process의 thread끼리 전환하면 보통 같은 address space를 사용하므로 서로 다른 process 사이의 address-space 전환과 비용 특성이 같다고 단정할 수 없다. 실제 TLB 유지·tagging 동작도 architecture와 OS 구현에 따라 달라진다.

또한 shared lock contention은 context switch 그 자체가 만드는 고정 비용이 아니다. Thread를 과도하게 늘려 같은 lock과 cache line을 더 많이 경쟁하게 만들면 contention과 coherence traffic이 커지고, 그 결과 blocking과 scheduling이 다시 늘어날 수 있는 **workload-level 효과**다.

```text
너무 많은 runnable thread
        │
        ├─ scheduler 선택/전환 증가
        ├─ working-set locality 악화 가능
        └─ shared resource 경쟁 증가 가능
                    │
                    ▼
          latency·throughput에 추가 비용
```

예를 들어 4-core CPU에서 CPU-bound runnable thread를 4개에서 400개로 늘리면 실제 CPU parallelism은 4를 넘지 않는다. 그 대신 runnable queue와 전환·경쟁 비용이 증가할 수 있다.

### 측정할 때 생성 비용과 queue 비용을 나눈다

thread 수를 줄였더니 지연 시간이 나빠졌다고 해서 곧바로 thread creation이 병목이었다고 결론내리면 안 된다. active worker, queue wait, task execution time, context switch, memory usage를 따로 봐야 한다. pool이 작아 queue가 길어진 것과 pool이 커서 scheduling contention이 커진 것은 반대 방향의 문제다.

Backend executor의 크기도 CPU 수 하나로 정하지 않는다. CPU-bound인지, blocking 시간이 얼마나 되는지, DB connection 같은 downstream capacity가 얼마인지까지 함께 봐야 한다.
