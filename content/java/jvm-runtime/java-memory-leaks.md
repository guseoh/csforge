---
kind: concept
contentKey: java.core.jvm-runtime.java-memory-leaks
topicContentKey: java.core.jvm-runtime
slug: java-memory-leaks
title: "Java memory leaks"
summary: "GC가 있어도 cache, listener, ThreadLocal 등에서 필요 없는 객체가 reachable 상태로 남아 memory leak이 될 수 있음을 설명한다"
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/package-summary.html"
    title: "Java SE 25 API: java.lang.ref"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: reference와 reachability model 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html"
    title: "Java SE 25 API: ThreadLocal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: thread-local value lifecycle 확인
---
# Java memory leak

## 쉬운 진입

GC가 있는 Java에서도 memory leak은 생긴다. leak의 핵심은 메모리가 물리적으로
사라지지 않는다는 뜻이 아니라, 더 이상 필요하지 않은 객체가 살아 있는 root에서
계속 reachable하다는 것이다.

## 정확한 메커니즘

~~~
static final Map<String, byte[]> cache = new HashMap<>();

void remember(String id, byte[] payload) {
    cache.put(id, payload); // 만료·상한·삭제가 없으면 계속 retain
}
~~~

흔한 root는 static cache, 등록 해제하지 않은 listener, 장수 executor의 ThreadLocal,
전역 collection이다. heap dump에서 retained path를 root까지 따라가면 “어떤 객체가
큰가”뿐 아니라 “왜 아직 도달 가능한가”를 찾을 수 있다. GC가 정상적으로 unreachable
객체를 회수하고 있어도 retained graph의 정책 오류는 남는다.

해결은 수명에 맞는 owner를 두고, cache에 크기·TTL·eviction을 두고, listener를
unregister하고, pool task의 ThreadLocal을 finally에서 remove하는 식으로 ownership을
명시하는 것이다. weak reference는 특정 metadata 관계에만 제한적으로 사용하고 일반
leak 해결책으로 남용하지 않는다.

## 흔한 오해

- OutOfMemoryError가 없다고 leak이 없는 것은 아니다.
- GC를 더 자주 실행하는 것이 reachable 객체의 잘못된 owner를 고치지 않는다.
- heap에서 큰 객체 하나를 찾는 것만으로 retained path 원인을 설명할 수 없다.
