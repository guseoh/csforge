---
kind: concept
contentKey: operating-systems.core.race-critical-section.atomic-operation
topicContentKey: operating-systems.core.race-critical-section
slug: atomic-operation
title: "Atomic Operation"
summary: "중간 상태가 관찰되지 않는 atomic transition과 visibility·ordering·복합 invariant의 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf"
    title: "Operating Systems: Three Easy Pieces — Locks"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "mutex/lock이 atomic primitive를 이용해 critical section의 mutual exclusion을 구현하는 방식을 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man2/futex.2.html"
    title: "futex(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux futex가 atomic user-space state와 kernel blocking/wakeup을 연결하는 방식을 확인한다."
    displayOrder: 2
---
# Atomic Operation

### 다른 실행 흐름이 중간 상태를 관찰하지 못하게 한다

atomic operation은 concurrency 관점에서 하나의 indivisible state transition처럼 보이는 연산이다. 예를 들어 atomic increment가 `10 → 11`로 바뀌는 동안 다른 thread가 update의 중간 상태에 끼어들어 같은 이전 값을 바탕으로 별도의 read-modify-write를 완료하지 못하도록 primitive가 보장할 수 있다.

이 의미는 source code 한 줄이나 machine instruction 개수와 동일하지 않다. CPU가 제공하는 atomic read-modify-write primitive, OS lock, language runtime atomic type 등 서로 다른 층에서 더 큰 operation을 atomic하게 보이도록 구현할 수 있다.

### atomicity와 visibility·ordering은 같은 단어가 아니다

값 하나의 update가 atomic하더라도 다른 memory access와 어떤 순서로 보이는지, update된 값을 다른 thread가 언제 관찰하는지는 memory model 계약을 따로 봐야 한다. 어떤 atomic API는 ordering semantics까지 제공하지만 `atomic = 모든 memory operation이 자동으로 순서화된다`고 일반화하면 안 된다.

이 경계는 Java에서 특히 중요하다. JMM의 happens-before나 `volatile`, atomic class의 memory-effect semantics는 Java 층의 계약이고, OS Concept에서는 원자성 자체가 무엇을 해결하고 무엇을 해결하지 않는지를 구분한다.

### low-level primitive에서도 atomic 범위는 명확하다

Linux의 `futex` wait 계열 동작은 user-space의 futex word 값을 확인하고 필요하면 sleep하는 과정에서, 값 비교와 blocking 진입 사이에 상대 thread의 상태 변경을 놓치는 race가 생기지 않도록 atomic compare-and-block 의미를 제공한다. 반대로 uncontended lock에서는 user-space atomic operation만으로 빠르게 성공하고 실제 contention이 있을 때 kernel의 wait/wakeup 경로를 사용할 수 있다.

이 사례는 atomicity의 범위를 잘 보여 준다. primitive는 **자신이 계약한 특정 state transition**을 경쟁 없이 수행하도록 돕지만, 그 사실만으로 application의 다른 여러 field나 DB 상태까지 하나의 atomic operation으로 묶이는 것은 아니다.

### 변수 하나와 business invariant는 크기가 다를 수 있다

`attemptCount++` 하나는 atomic primitive로 충분할 수 있다. 하지만 `balance 감소 + ledger entry 생성 + status 변경`처럼 여러 state가 하나의 application invariant를 이루면 단일 atomic integer로 전체 operation을 원자적으로 만들 수 없다. 이 경우 lock, database transaction, CAS loop 또는 더 높은 수준의 protocol이 필요할 수 있다.

그래서 atomic primitive를 고를 때는 `어떤 instruction을 한 번에 실행할까`보다 **어떤 observable state transition을 경쟁 없이 보장해야 하는가**를 먼저 정의해야 한다.

### 핵심을 다시 연결하면

`atomic`이라는 이름만 보고 thread-safe라고 결론 내리면 안 된다. 하나의 operation이 indivisible하다는 보장과 여러 operation 사이의 ordering·visibility, 그리고 여러 state가 이루는 business invariant는 서로 다른 범위의 계약이다.
