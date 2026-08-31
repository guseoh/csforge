---
kind: concept
contentKey: java.core.concurrency.semaphore-permits
topicContentKey: java.core.concurrency
slug: semaphore-permits
title: "Semaphore permits"
summary: "동시에 사용할 수 있는 resource나 작업 수를 permit으로 제한하는 Semaphore의 acquire/release 동작과 concurrency limit 의미를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 140
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Semaphore.html"
    title: "Java SE 25 API: Semaphore"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: permit acquire/release와 memory consistency 확인
---
# Semaphore와 permits

## 쉬운 진입

동시에 외부 API를 세 개까지만 호출하거나 제한된 connection을 공유해야 한다면 “입장권”
수를 둔다. Semaphore는 permit을 acquire한 작업만 critical resource를 사용하게 하고,
끝나면 release하도록 한다.

## 정확한 메커니즘

~~~
Semaphore slots = new Semaphore(3);
slots.acquire();
try {
    useLimitedResource();
} finally {
    slots.release();
}
~~~

acquire는 permit이 없으면 기다리고, tryAcquire는 즉시 또는 timeout 결과를 제공한다.
release는 permit을 돌려주며, Semaphore는 monitor lock과 달리 permit을 획득한 thread가
반드시 같은 thread일 것을 요구하는 ownership 개념이 없다. 따라서 release 책임을
구조적으로 관리하고, double release가 실제 허용량을 부풀리지 않도록 한다.

fair 설정은 대기 thread에 permit을 배분하는 정책의 선택이지 전체 시스템 공정성을
보장하는 마법이 아니다. Semaphore는 resource의 동시 사용량을 제한하지만 resource
자체의 상태 invariant나 작업 실패 복구를 대신하지 않는다.

## 흔한 오해

- Semaphore permit은 synchronized monitor ownership과 같은 thread 소유권이 아니다.
- acquire 후 예외가 나도 release가 자동으로 호출되지 않는다.
- permit 수를 늘리면 제한된 외부 resource가 더 많이 생기지 않는다.
