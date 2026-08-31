---
kind: concept
contentKey: java.core.concurrency.concurrent-collections
topicContentKey: java.core.concurrency
slug: concurrent-collections
title: "Concurrent collections"
summary: "ConcurrentHashMap과 concurrent queue가 제공하는 operation-level thread-safety contract를 이해하고 임의의 multi-step logic 전체가 atomic하다고 가정하지 않는다"
level: 2
status: PUBLISHED
displayOrder: 150
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html"
    title: "Java SE 25 API: ConcurrentHashMap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: concurrent map operation과 compute 계열 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentLinkedQueue.html"
    title: "Java SE 25 API: ConcurrentLinkedQueue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: non-blocking concurrent queue 계약 확인
---
# Concurrent collections

## 쉬운 진입

여러 thread가 map이나 queue를 공유하면 일반 HashMap에 외부 lock을 붙이거나 concurrent
collection을 선택해야 한다. ConcurrentHashMap은 개별 조회·갱신과 API가 제공하는
compute/merge 같은 compound operation을 concurrent 환경에 맞게 제공한다.

## 정확한 메커니즘

~~~
ConcurrentHashMap<String, LongAdder> counts = new ConcurrentHashMap<>();
counts.computeIfAbsent("java", key -> new LongAdder()).increment();

ConcurrentLinkedQueue<Task> tasks = new ConcurrentLinkedQueue<>();
tasks.offer(task);
Task next = tasks.poll();
~~~

“없으면 넣기”를 containsKey와 put으로 나누면 두 thread가 동시에 같은 판단을 할 수
있다. 해당 의미를 API가 제공하는 computeIfAbsent/putIfAbsent/merge로 표현하거나,
여러 collection과 domain invariant를 하나의 lock으로 묶는다. concurrent iterator는
일반 collection과 다른 weakly consistent 관찰을 제공할 수 있으므로 snapshot이나
전체 정렬을 자동으로 기대하지 않는다.

thread-safe collection은 collection 내부 구조와 정해진 operation을 보호할 뿐, 원소
객체를 자동으로 immutable하게 만들거나 여러 operation의 business transaction을
만들지 않는다. ConcurrentHashMap은 null key/value를 허용하지 않는다는 API 특성도
일반 HashMap과의 차이다.

## 흔한 오해

- ConcurrentHashMap을 쓴다고 containsKey 후 put 전체가 자동으로 원자적이 되지 않는다.
- concurrent queue의 poll 결과가 항상 non-null인 것은 아니다.
- concurrent collection의 thread-safety가 저장된 mutable value까지 확장되지 않는다.
