---
kind: concept
contentKey: java.core.concurrency.race-shared-state
topicContentKey: java.core.concurrency
slug: race-shared-state
title: 공유 가변 상태와 race condition
summary: 여러 실행 흐름이 같은 상태를 읽고 쓸 때 결과가 달라지는 이유를 찾는다
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java Language Specification 17장: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 스레드 메모리 모델과 동기화 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/package-summary.html"
    title: java.util.concurrent.atomic API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 원자 변수와 lock-free 연산 선택 확인
---
# 공유 상태와 race condition

두 스레드가 같은 가변 상태에 접근하고 적어도 하나가 쓰기를 하면 실행 순서에 따라 결과가 달라질 수 있습니다. `count++`는 읽기·더하기·쓰기가 결합된 하나의 원자 작업이 아니므로 두 스레드가 같은 값을 읽고 한 번의 증가를 잃을 수 있습니다.

```java
// 공유 상태라면 단순한 ++로는 안전하지 않다.
count++;
```

문제의 핵심은 단순히 “동시에 실행된다”가 아니라 공유 상태에 대한 원자성·가시성·순서 보장이 부족하다는 점입니다. 해결책은 lock으로 임계 구간을 보호하거나, `AtomicInteger`처럼 원자 연산을 사용하거나, 아예 불변 데이터와 메시지 전달로 공유 변경을 줄이는 것입니다.

스레드 수를 늘리거나 virtual thread로 바꾸는 것만으로 race가 해결되지 않습니다. 먼저 어떤 상태가 공유되고 누가 소유하는지, 갱신의 불변식이 무엇인지 정의해야 합니다.
