---
kind: concept
contentKey: java.core.jvm-runtime.gc-reachability-roots
topicContentKey: java.core.jvm-runtime
slug: gc-reachability-roots
title: "GC reachability and roots"
summary: "source-level scope 종료와 즉시 deallocation을 동일시하지 않고 GC root에서 객체까지의 reachability로 수명 판단을 설명한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html#jvms-2.5.3"
    title: "Java SE 25 JVMS: Heap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: heap과 automatic storage reclamation 범위 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/package-summary.html"
    title: "Java SE 25 API: java.lang.ref"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: reachability와 reference processing 확인
---
# GC reachability와 roots

## 쉬운 진입

메서드가 끝났다고 그 안에서 만든 객체가 바로 사라지는 것은 아니다. 다른 살아 있는
참조가 있으면 계속 사용할 수 있고, 반대로 lexical scope 안에 source 변수가 남아 있어도
runtime이 더 이상 그 값을 사용할 수 없다고 판단하면 reachability가 달라질 수 있다.

## 정확한 메커니즘

~~~
GC root -> cache -> object A -> object B
                     +                      object C
~~~

GC는 일반적으로 thread의 실행 상태, static reference 등 root에서 참조를 따라 도달할
수 있는 object graph를 보존하고, 더 이상 도달할 수 없는 객체를 reclaim 후보로
판단한다. 정확한 root 집합과 collector 동작은 JVM implementation의 영역이다. 객체가
unreachable이 되었다는 것은 “즉시 free된다”가 아니라 collector가 회수할 수 있는
상태라는 뜻이다.

참조를 null로 대입하는 것이 항상 필요하지는 않지만, 긴 메서드나 큰 loop에서 더 이상
사용하지 않는 장수 참조를 제거하면 reachability를 일찍 끊는 데 도움이 될 수 있다.
source scope, JIT liveness, GC timing을 서로 다른 관찰로 분리해야 memory 문제를
올바르게 설명할 수 있다.

## 흔한 오해

- 메서드가 끝난 순간 모든 지역 객체가 반드시 reclaim되는 것은 아니다.
- new 직후 객체의 주소가 안정적으로 유지된다고 보장되지 않는다.
- System.gc() 호출이 즉시 특정 객체를 회수한다고 보장되지 않는다.
