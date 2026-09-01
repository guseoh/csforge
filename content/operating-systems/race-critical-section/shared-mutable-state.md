---
kind: concept
contentKey: operating-systems.core.race-critical-section.shared-mutable-state
topicContentKey: operating-systems.core.race-critical-section
slug: shared-mutable-state
title: "Shared Mutable State"
summary: "여러 실행 흐름이 같은 변경 가능한 invariant에 접근할 때 concurrency 문제가 생기는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Shared Mutable State

### 공유되고 변경 가능할 때 순서가 correctness에 들어온다

immutable value를 여러 thread가 읽는 것만으로는 보통 같은 종류의 update race가 생기지 않는다. 문제가 되는 핵심은 여러 실행 흐름이 **같은 state를 공유하고, 그 state가 변경되며, 둘 이상의 operation이 서로의 중간 상태에 영향을 줄 수 있다는 것**이다.

예를 들어 `balance`와 `version` 두 필드가 항상 함께 갱신되어야 한다는 invariant가 있다고 하자. T1이 balance만 바꾼 순간 T2가 두 필드를 읽으면 서로 다른 version의 조합을 관찰할 수 있다. 보호 대상은 변수 하나가 아니라 application이 유지하려는 invariant일 수 있다.

### 공유를 줄이는 것도 synchronization 설계다

state를 한 owner에게만 맡기고 message로 command를 전달하거나 immutable snapshot을 교환하면 동시에 같은 mutable object를 수정하는 범위를 줄일 수 있다. 반대로 shared memory를 유지한다면 어떤 operation이 atomic해야 하는지, 어떤 lock/primitive가 어떤 invariant를 보호하는지 명시해야 한다.

중요한 것은 `공유 state가 있으니 lock 하나`가 아니다. lock을 두 군데서 서로 다르게 사용하거나 일부 code path가 lock 없이 접근하면 protection protocol이 성립하지 않는다.

### DB transaction과 JVM shared memory는 다른 층이다

여러 request thread가 singleton cache나 in-memory counter를 갱신하는 문제는 JVM/OS thread concurrency 문제다. DB transaction이 성공적으로 commit된다고 Java heap의 read-modify-write가 자동으로 atomic해지는 것은 아니다. 저장소 invariant와 process-local shared-state invariant는 각각의 경계에서 보호해야 한다.
