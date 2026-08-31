---
kind: concept
contentKey: java.core.concurrency.atomic-cas
topicContentKey: java.core.concurrency
slug: atomic-cas
title: "Atomic variables and CAS"
summary: "compare-and-set의 expected/current 비교, 성공·실패 retry와 contention을 이해하고 단일 atomic variable이 복합 invariant를 자동 보호하지 못함을 판단한다"
level: 3
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html"
    title: "Java SE 25 API: AtomicInteger"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: atomic update와 compare-and-set 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/package-summary.html"
    title: "Java SE 25 API: java.util.concurrent.atomic"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: single-variable atomic toolkit 범위 확인
---
# Atomic 변수와 CAS

## 쉬운 진입

CAS(compare-and-set)는 “현재 값이 내가 예상한 값이면 새 값으로 바꿔라”라는 한 번의
조건부 갱신이다. 다른 thread가 먼저 바꿨다면 실패하며, 실패를 확인한 caller가 새 현재
값을 읽고 다시 계산하는 retry loop를 구성할 수 있다.

## 정확한 메커니즘

~~~
AtomicInteger count = new AtomicInteger();
int update() {
    for (;;) {
        int current = count.get();
        int next = current + 1;
        if (count.compareAndSet(current, next)) {
            return next;
        }
    }
}
~~~

성공한 CAS는 expected와 current가 일치한 순간의 갱신이고, 실패는 update가 적용되지
않았다는 뜻이다. contention이 높으면 retry가 반복되어 CPU를 소비할 수 있다. Atomic
API의 특정 메서드는 단일 변수 갱신을 위한 것이며, “항상 lock-free”라는 progress
보장은 모든 고수준 알고리즘이나 모든 구현에 자동으로 붙지 않는다.

잔액과 예약 수처럼 두 값의 관계가 invariant라면 AtomicInteger 두 개를 각각 갱신해도
두 갱신의 일관된 묶음이 되지 않는다. 하나의 immutable 상태 객체를 AtomicReference로
교체하거나 Lock으로 여러 field를 같은 critical section에 두는 설계를 검토한다.

## 흔한 오해

- CAS 실패는 예외가 아니라 조건이 더 이상 맞지 않았다는 일반적인 결과다.
- atomic 변수 하나가 임의의 여러 field invariant를 보호하지 않는다.
- CAS retry가 항상 blocking lock보다 빠르거나 항상 lock-free 진행을 보장하지 않는다.
