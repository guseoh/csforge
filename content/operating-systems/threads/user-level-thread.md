---
kind: concept
contentKey: operating-systems.core.threads.user-level-thread
topicContentKey: operating-systems.core.threads
slug: user-level-thread
title: "User-Level Thread"
summary: "runtime이 logical thread를 scheduling하고 kernel thread에 multiplex하는 실행 모델을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# User-Level Thread

User-level thread는 **application runtime이나 library가 logical execution context와 scheduling을 관리하는 모델**이다. Logical thread 사이의 전환을 매번 kernel scheduler에 맡기지 않아도 되므로 생성·전환 비용을 줄이고 많은 logical task를 더 적은 수의 kernel-visible thread 위에 올릴 수 있다.

```text
logical thread A ─┐
logical thread B ─┼─ runtime scheduler → kernel thread(s) → OS scheduler → CPU
logical thread C ─┘
```

### 실제 CPU parallelism은 아래 실행 자원에 제한된다

Logical thread가 수만 개 있어도 동시에 CPU에서 실행되는 수가 그만큼 늘어나는 것은 아니다. Runtime이 여러 logical thread를 하나 또는 여러 kernel thread에 multiplex하며, 실제 parallelism은 kernel-visible thread와 CPU core의 수에 제한된다.

### Blocking의 영향은 mapping 방식에 따라 달라진다

가장 단순한 many-to-one 모델에서는 carrier 역할을 하는 kernel thread 하나가 blocking system call에서 멈추면 그 위의 다른 logical thread도 CPU에 올라갈 수 없다.

하지만 user-level threading이 항상 이 한계를 그대로 갖는 것은 아니다. Runtime이 여러 carrier를 사용하거나 blocking operation을 감지해 다른 logical thread를 실행할 수 있다면 영향을 줄일 수 있다. 따라서 핵심 질문은 **logical thread가 기다릴 때 runtime이 underlying kernel thread를 다른 작업에 재사용할 수 있는가**이다.

User-Level Thread의 핵심은 thread 수 자체가 아니라 **logical scheduling을 user space가 맡으면서 kernel-visible execution resource와의 mapping을 어떻게 구성하는가**에 있다. Java virtual thread는 이 모델의 현대적인 사례 중 하나이며 뒤 Concept에서 구체적으로 다룬다.