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

Thread는 process보다 공유하는 resource가 많아 상대적으로 가볍게 만들 수 있지만 비용이 없는 실행 단위는 아니다. Thread를 만들려면 실행 context와 stack, runtime 또는 kernel이 추적할 metadata가 필요하다. Kernel-visible thread라면 scheduler가 관리할 task state도 추가된다.

작업이 매우 짧은데 매번 새 thread를 만들고 종료한다면 실제 작업보다 생성·정리 비용의 비중이 커질 수 있다.

### 실행 thread가 많아지면 scheduling 비용도 늘 수 있다

Runnable thread 수가 CPU가 동시에 실행할 수 있는 수보다 훨씬 많으면 scheduler가 여러 thread 사이에서 CPU를 반복해서 전환해야 한다.

```text
적은 runnable thread
→ 각 thread가 비교적 오래 실행

너무 많은 runnable thread
→ ready queue 증가
→ context switch 증가 가능
→ cache locality 악화 가능
```

Context switch에는 register 저장·복원 같은 직접 비용이 있고, 새 thread의 working set을 사용하면서 cache locality가 달라지는 간접 비용도 생길 수 있다.

같은 process의 thread 전환과 서로 다른 process 사이 전환의 비용이 항상 같다고 볼 수도 없다. 같은 address space를 공유하는지, CPU/OS가 translation state를 어떻게 관리하는지에 따라 비용 특성이 달라질 수 있다.

### Thread 수는 생성 비용만 보고 정하지 않는다

Thread를 적게 만들면 생성·전환 비용은 줄 수 있지만 runnable work가 충분한데 실행 thread가 너무 적으면 CPU나 I/O 대기 시간을 겹칠 기회를 놓칠 수 있다. 반대로 너무 많이 만들면 memory 사용과 scheduling 경쟁이 커질 수 있다.

따라서 Thread Creation·Switch Cost의 핵심은 **thread 하나마다 stack과 실행 metadata가 필요하고, runnable thread 수가 커질수록 생성·memory·scheduling 비용이 함께 늘 수 있다는 점**이다. 적정 thread 수는 다음 Concept에서 workload 성격과 함께 판단한다.