---
kind: concept
contentKey: java.core.jvm-runtime.reference-strengths
topicContentKey: java.core.jvm-runtime
slug: reference-strengths
title: "Strong·Soft·Weak·Phantom Reference"
summary: "strong·soft·weak·phantom reference가 객체를 얼마나 강하게 reachable하게 유지하는지 구분하고 cache나 cleanup에 남용하지 않는다"
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/package-summary.html"
    title: "Java SE 25 API: java.lang.ref"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: reference strength와 reachability 처리 개요 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/PhantomReference.html"
    title: "PhantomReference (Java SE 25 API)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: phantom reference와 ReferenceQueue 사용 확인
  - url: "https://d2.naver.com/helloworld/329631"
    title: "네이버 D2: Java Reference와 GC"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: strong·soft·weak·phantom reference의 학습 흐름 보충
---
# Strong·Soft·Weak·Phantom Reference

일반 Java reference는 객체를 강하게 reachable하게 유지합니다. 하지만 metadata나 보조 cache처럼 **이 관계 때문에 객체의 본래 수명이 늘어나서는 안 되는 경우**도 있습니다. `java.lang.ref`는 이런 관계를 표현하기 위해 soft, weak, phantom reference를 제공합니다.

핵심은 "GC를 조종하는 특수 포인터"라고 외우는 것이 아니라 **이 reference가 객체 생존에 어느 정도의 소유권을 가지는가**를 이해하는 것입니다.

### Strong reference가 기본 소유 관계다

```java
User user = new User();
```

살아 있는 strong reference 경로가 객체까지 이어지면 객체는 strongly reachable합니다.

```text
live root ──▶ owner ──▶ User
```

핵심 domain state나 요청 처리에 반드시 필요한 객체는 일반적으로 strong reference로 소유합니다.

### WeakReference는 객체 수명을 강제로 연장하지 않는다

```java
WeakReference<User> weak = new WeakReference<>(user);
```

객체가 strong 또는 soft reference로 더 이상 도달되지 않고 weak reference를 통해서만 도달할 수 있는 weakly reachable 상태가 되면, JVM의 reference processing 과정에서 해당 weak reference는 clear될 수 있습니다.

```text
strong path 존재
Root ──▶ User

strong/soft path 소멸
WeakReference ──▶ User
                   │
                   └─ weakly reachable
```

따라서 `weak.get()`은 어느 시점에는 객체를 반환하다가 이후 `null`을 반환할 수 있습니다. 이 객체가 반드시 살아 있어야 하는 업무 상태라면 weak reference만으로 보유하면 안 됩니다.

Weak reference는 원본 객체의 수명을 늘리지 않는 metadata 관계나 `WeakHashMap` 같은 특수 구조에 적합할 수 있습니다.

### SoftReference는 application cache 정책을 대신하지 않는다

Soft reference는 strong reference는 없지만 soft reference를 통해 reachable한 객체를 표현합니다. JVM은 memory demand에 따라 soft reference를 clear할 수 있으며, Java API는 `OutOfMemoryError`를 던지기 전에 softly-reachable 객체에 대한 soft reference가 clear되어야 한다는 중요한 보장을 둡니다.

반면 **언제 어떤 soft reference가 먼저 clear되는지에 대한 TTL·LRU·순서 계약은 없습니다.**

```text
SoftReference cache
   ├─ TTL 보장 없음
   ├─ 최대 entry 수 보장 없음
   └─ eviction 순서 보장 없음
```

그래서 일반 애플리케이션 cache에는 최대 크기, TTL, 명시적 eviction, hit/miss 관찰처럼 업무 정책을 표현할 수 있는 cache abstraction이 더 적합한 경우가 많습니다.

### PhantomReference는 객체를 다시 꺼내는 참조가 아니다

```java
ReferenceQueue<Resource> queue = new ReferenceQueue<>();
PhantomReference<Resource> phantom =
        new PhantomReference<>(resource, queue);
```

`PhantomReference.get()`은 항상 `null`을 반환합니다. 목적은 referent를 다시 사용하기 위한 것이 아니라 객체가 phantom reachable 단계에 들어간 뒤 `ReferenceQueue`와 함께 **수명 종료 후 bookkeeping이나 cleanup trigger를 관찰하는 것**입니다.

이것도 deterministic destructor는 아닙니다. GC와 reference processing 시점은 애플리케이션이 정확히 지정할 수 없으므로 파일, socket 같은 자원은 가능하면 `try-with-resources`와 명시적 `close()`가 우선입니다.

### ReferenceQueue를 쓰면 Reference 객체 자체도 관리해야 한다

Reference를 queue에 등록했다고 queue가 그 `Reference` 객체의 수명을 대신 보장하는 것은 아닙니다. Notification을 처리할 필요가 있는 동안에는 프로그램이 reference object 자체도 reachable하게 유지해야 합니다.

```text
referent reachability 변화
        │
        ▼
reference processing
        │
        ▼
ReferenceQueue
        │
        ▼
cleanup/bookkeeping
```

이 점을 놓치면 "queue에 등록했는데 왜 알림을 못 받았지?" 같은 잘못된 기대를 만들 수 있습니다.

### reference strength를 고를 때 ownership부터 묻는다

Reference type을 선택하기 전에 먼저 다음 질문을 합니다.

> 이 객체가 살아 있어야 할 책임은 누가 가지고 있는가?

- 반드시 살아 있어야 한다면 strong ownership이 필요합니다.
- 이 관계 때문에 원본 수명이 늘어나면 안 된다면 weak 관계를 검토할 수 있습니다.
- memory-sensitive 보조 cache라 해도 SoftReference 하나로 cache 정책 전체를 대체하지 않습니다.
- 수명 종료 이후 cleanup 관찰이 필요하면 PhantomReference/ReferenceQueue 또는 더 높은 수준 API를 검토합니다.

### 정리

Strong reference는 객체를 일반적으로 살아 있게 유지하는 기본 소유 관계입니다. WeakReference는 원본 객체의 수명을 강하게 연장하지 않는 관계에 적합하고, SoftReference는 memory pressure에 따라 clear될 수 있지만 TTL이나 eviction 정책을 제공하지 않습니다. PhantomReference는 referent를 다시 얻는 API가 아니라 ReferenceQueue와 함께 수명 종료 이후를 관찰하는 도구입니다. Reference strength는 GC 꼼수보다 ownership과 lifecycle을 표현하는 계약으로 이해하는 것이 중요합니다.
