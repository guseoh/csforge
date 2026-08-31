---
kind: concept
contentKey: java.core.concurrency.locks-reentrantlock-condition
topicContentKey: java.core.concurrency
slug: locks-reentrantlock-condition
title: "Lock, ReentrantLock, and Condition"
summary: "synchronized보다 timed/interruptible lock acquisition이나 여러 Condition이 필요한 경우 explicit Lock API를 선택하고 trade-off를 설명한다"
level: 3
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/Lock.html"
    title: "Java SE 25 API: Lock"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: lock acquisition과 unlock contract 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html"
    title: "Java SE 25 API: ReentrantLock"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: reentrant lock과 fairness 옵션 확인
---
# Lock·ReentrantLock·Condition

## 쉬운 진입

synchronized는 간결하고 자동으로 lock을 풀어 준다. 반면 명시적 Lock은 일정 시간만
기다리거나 interrupt에 반응하며 획득하고, 하나의 lock에 여러 waiting condition을
나누는 기능이 필요할 때 선택할 수 있다.

## 정확한 메커니즘

~~~
final Lock lock = new ReentrantLock();
final Condition notEmpty = lock.newCondition();

lock.lock();
try {
    while (queue.isEmpty()) {
        notEmpty.await();
    }
    consume(queue.remove());
} finally {
    lock.unlock();
}
~~~

lock은 자동 scope 문법이 없으므로 unlock을 finally에 둔다. await는 condition을 기다리는
동안 lock을 release했다가 다시 획득하고, 깨어난 뒤에도 predicate를 while로 재확인한다.
tryLock(timeout)이나 lockInterruptibly()는 무한 대기 정책을 바꿀 수 있지만 그 결과로
취소·timeout 경로를 호출자가 처리해야 한다. 하나의 ReentrantLock은 같은 thread가
재진입할 수 있으며, 공정성 설정은 대기 순서와 throughput trade-off를 바꿀 수 있다.

Lock은 synchronized보다 항상 우월한 것이 아니다. 단순한 mutual exclusion이면
synchronized가 ownership 실수를 줄이고, explicit API가 정말 필요한 use case에서만
Lock을 사용한다.

## 흔한 오해

- await 뒤에는 조건이 참이라고 가정하지 말고 predicate를 다시 검사해야 한다.
- lockInterruptibly()는 lock을 자동으로 unlock해 주지 않는다.
- Condition은 Lock 없이 임의로 만들고 사용하는 대기열이 아니다.
