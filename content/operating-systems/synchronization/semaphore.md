---
kind: concept
contentKey: operating-systems.core.synchronization.semaphore
topicContentKey: operating-systems.core.synchronization
slug: semaphore
title: "Semaphore"
summary: "counting permit로 동시 접근 수와 event handoff를 표현하는 semaphore semantics를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-sema.pdf"
    title: "Operating Systems: Three Easy Pieces — Semaphores"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "counting semaphore가 mutual exclusion과 ordering/condition signaling을 표현하는 방식을 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man7/sem_overview.7.html"
    title: "sem_overview(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "POSIX semaphore의 count와 wait/post 기본 semantics를 확인한다."
    displayOrder: 2
---
# Semaphore

Semaphore는 **사용 가능한 permit 수를 counter로 관리하는 synchronization primitive**다. Permit이 남아 있으면 실행 흐름이 하나를 획득해 진행하고, 모두 사용 중이면 새로운 요청은 permit이 반환될 때까지 기다린다.

초기 permit가 3이라고 하자.

```text
T1 acquire  3 → 2
T2 acquire  2 → 1
T3 acquire  1 → 0
T4 acquire  0 → wait

누군가 release → permit 증가 → T4 진행 가능
```

![Semaphore permit 획득과 반환 흐름](/learning/operating-systems/semaphore-permits.svg)

### Mutex와 중심 의미가 다르다

Count가 1인 binary semaphore는 한 번에 하나만 통과시키는 데 사용할 수 있어 mutex와 비슷해 보인다. 하지만 mutex의 중심은 **owner가 있는 mutual exclusion**이고, semaphore의 중심은 **permit count와 wait/post protocol**이다.

Semaphore에서는 한 실행 흐름이 wait하고 다른 실행 흐름이 post하여 다음 진행을 허용하는 signaling에도 사용할 수 있다. 따라서 단순히 count가 0/1이라는 사실만으로 mutex와 같은 primitive라고 보지 않는다.

### Permit는 실제 capacity와 맞아야 한다

Semaphore는 실제 resource를 생성하지 않는다. Permit count는 보호하거나 제한하려는 resource capacity를 표현할 뿐이다. Acquire 이후 release를 누락하면 permit가 줄어든 채 돌아오지 않고, 반대로 과도하게 release하면 의도한 concurrency limit이 깨질 수 있다.

Semaphore의 핵심은 **N개의 permit를 통해 동시에 진행할 수 있는 실행 흐름의 수나 event handoff를 명시적으로 표현하는 것**이다.