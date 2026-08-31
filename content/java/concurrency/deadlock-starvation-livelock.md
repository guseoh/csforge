---
kind: concept
contentKey: java.core.concurrency.deadlock-starvation-livelock
topicContentKey: java.core.concurrency
slug: deadlock-starvation-livelock
title: "Deadlock, starvation, and livelock"
summary: "circular lock wait, 작업 기회 부족, 서로 반응만 하며 진전하지 못하는 liveness 문제를 구분하고 lock ordering과 progress 관점에서 진단한다"
level: 3
status: PUBLISHED
displayOrder: 190
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: lock·wait와 thread execution 모델 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/Lock.html"
    title: "Java SE 25 API: Lock"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: timed/interruptible acquisition 선택지 확인
---
# Deadlock·starvation·livelock

## 쉬운 진입

프로그램이 멈춘 것처럼 보여도 원인은 하나가 아니다. 두 thread가 서로 가진 lock을
기다리면 deadlock, 특정 thread가 계속 실행 기회를 빼앗기면 starvation, 서로 양보하고
상태를 되돌리느라 실제 작업을 진전시키지 못하면 livelock이다.

## 정확한 메커니즘

~~~
// Thread A: lock(left) -> lock(right)
// Thread B: lock(right) -> lock(left)
~~~

deadlock은 상호 배제, hold-and-wait, no preemption, circular wait 같은 조건이 결합된
순환 대기다. 여러 lock을 잡아야 한다면 전역 순서를 정해 모든 경로가 같은 순서로
획득하게 하는 것이 기본 예방책이다. Lock의 tryLock(timeout)과 interruptible
acquisition은 무한 대기를 감지·회복하는 선택지를 제공하지만 rollback과 retry가
올바른지 설계해야 한다.

starvation은 lock 경쟁, 우선순위, 제한된 pool worker나 queue 정책 때문에 특정 작업이
계속 진행하지 못하는 문제다. livelock은 thread가 살아 있고 상태도 바꾸지만 서로의
반응 때문에 유용한 progress가 없다. thread dump는 대기 관계의 증거를 주지만,
재현·상태 관찰과 함께 원인을 분리해야 한다.

## 흔한 오해

- 모든 응답 지연이 deadlock인 것은 아니다.
- thread가 RUNNABLE이라고 유용한 작업을 진전시키고 있다는 뜻은 아니다.
- lock ordering만으로 queue starvation이나 외부 I/O 대기를 모두 해결하지 못한다.
