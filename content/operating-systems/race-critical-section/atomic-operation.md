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

Atomic operation은 concurrent execution에서 **중간 상태가 다른 실행 흐름에 노출되지 않는 하나의 indivisible state transition처럼 보이는 연산**이다.

예를 들어 atomic increment가 `10 → 11`을 보장한다면 다른 thread가 같은 이전 값 10을 기준으로 중간 단계에 끼어들어 update를 잃게 만들지 않도록 primitive가 동작한다.

### Source code 한 줄과 atomicity는 같은 개념이 아니다

`counter++`가 한 줄이라고 atomic한 것은 아니다. 반대로 내부적으로 여러 machine step을 사용하더라도 CPU atomic primitive나 lock을 이용해 더 큰 operation을 하나의 atomic transition처럼 보이게 만들 수 있다.

따라서 atomicity를 판단할 때는 코드 줄 수가 아니라 **어떤 observable state transition을 한 번에 보이도록 보장하는가**를 본다.

### Atomicity와 ordering·visibility는 분리해서 생각한다

하나의 update가 atomic하다는 사실만으로 주변의 모든 memory access가 원하는 순서로 관찰된다는 뜻은 아니다. Language/runtime의 atomic API가 ordering이나 visibility semantics까지 제공할 수 있지만 이는 해당 memory model의 별도 계약이다.

이 OS Concept에서는 원자성 자체에 집중한다. Java의 `volatile`, happens-before 같은 구체적인 보장은 Java/JMM 영역에서 따로 판단해야 한다.

### Atomic primitive 하나가 모든 invariant를 보호하는 것은 아니다

Counter 하나의 증가라면 하나의 atomic read-modify-write로 충분할 수 있다. 하지만 여러 field가 함께 바뀌어야 하나의 invariant가 유지된다면 각 field를 개별적으로 atomic하게 만드는 것만으로 전체 transition이 atomic해지지는 않는다.

Atomic Operation의 핵심은 **primitive가 계약한 범위의 state transition을 indivisible하게 만들 뿐이며, 보호해야 할 invariant가 더 크다면 그 범위를 덮는 별도의 synchronization protocol이 필요하다는 점**이다.