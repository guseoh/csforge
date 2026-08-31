---
kind: concept
contentKey: java.core.jvm-runtime.reference-strengths
topicContentKey: java.core.jvm-runtime
slug: reference-strengths
title: "Reference strengths"
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
---
# 모든 참조가 객체를 똑같이 살려 두는 것은 아니다

일반 Java 변수로 객체를 가리키면 보통 strong reference입니다. 이런 강한 참조 경로가 GC root에서 이어져 있으면 GC는 그 객체를 마음대로 회수하지 않습니다.

그런데 cache나 metadata처럼 "이 참조 때문에 객체를 꼭 살려 둘 필요는 없다"는 관계도 있습니다. Java의 `java.lang.ref`는 이런 관계를 표현하기 위해 soft, weak, phantom reference를 제공합니다.

### strong reference가 기본이다

```java
User user = new User();
```

`user`가 live한 strong reference이고 root에서 이 참조까지 도달할 수 있다면 객체는 strongly reachable합니다.

```text
GC Root ──▶ strong ref ──▶ User
```

일반 객체 ownership은 대부분 strong reference로 표현합니다. 다른 reference type은 특별한 수명 정책이 필요할 때만 사용합니다.

### WeakReference는 "이 참조 하나 때문에 살려 두지는 않겠다"에 가깝다

```java
WeakReference<User> weak = new WeakReference<>(user);
```

다른 strong reference가 모두 사라져 객체가 weakly reachable한 상태가 되면 GC는 해당 weak reference를 clear하고 객체를 회수할 수 있습니다.

```text
strong path 있음
Root ──▶ User              -> 살아 있음

strong path 사라짐
WeakReference ──▶ User     -> weakly reachable, GC 처리 가능
```

`WeakReference.get()`은 객체가 아직 남아 있으면 값을 줄 수 있지만, 나중에는 `null`이 될 수 있습니다.

그래서 weak reference를 사용한 코드는 **언제든 값이 사라질 수 있다는 조건**을 프로그램 논리에 포함해야 합니다.

### weak reference의 대표적인 용도는 보조 관계다

예를 들어 어떤 object에 대한 metadata를 저장하지만 metadata map 때문에 원래 object의 수명이 늘어나면 안 되는 상황이 있습니다. 이런 문제에 weak reference 기반 구조가 사용될 수 있습니다.

Java의 `WeakHashMap`도 key가 일반 strong reference가 아니라 weak 관계를 가지는 특수한 map입니다.

하지만 "메모리 절약이 필요하니 모든 map을 WeakHashMap으로 바꾼다"는 식으로 사용하면 안 됩니다. 언제 entry가 사라질지 애플리케이션이 정확히 결정할 수 없기 때문입니다.

### SoftReference는 메모리 상황을 고려한 참조지만 일반 cache 정책 대체재가 아니다

Soft reference는 weak보다 더 오래 보존될 여지가 있고 JVM이 memory demand를 고려해 clear할 수 있는 reference type입니다.

과거에는 "메모리가 부족하면 자동으로 지워지는 cache"라는 설명으로 많이 소개됐지만, 실무 cache의 일반적인 eviction 정책으로 권장하기 어렵습니다.

애플리케이션 cache에는 보통 다음이 더 중요합니다.

- 최대 entry 수/메모리 크기
- TTL
- access pattern
- 명시적인 eviction
- stale 허용 범위
- hit/miss 관찰

SoftReference에 맡기면 정확히 언제 무엇이 사라질지 애플리케이션이 통제하기 어렵습니다.

### PhantomReference는 객체를 다시 얻는 참조가 아니다

`PhantomReference`는 다른 reference와 목적이 다릅니다.

```java
ReferenceQueue<Resource> queue = new ReferenceQueue<>();
PhantomReference<Resource> phantom =
        new PhantomReference<>(resource, queue);
```

Phantom reference의 `get()`은 원래 객체를 반환하지 않습니다. 이미 수명 종료 단계에 들어간 객체를 다시 사용하거나 부활시키는 용도가 아닙니다.

ReferenceQueue와 함께 사용해 **객체가 특정 reachability 단계에 들어갔음을 관찰하고 후속 cleanup bookkeeping을 하는 용도**와 연결됩니다.

Native resource 관리 같은 특별한 경우에는 `Cleaner` 등 더 높은 수준 API를 검토할 수 있습니다. 그래도 파일이나 socket 같은 자원은 가능하면 `try-with-resources`처럼 deterministic한 명시적 close가 우선입니다.

### ReferenceQueue는 GC 이벤트의 작업 대기열처럼 사용할 수 있다

Reference object를 queue와 연결하면 JVM의 reference processing 이후 enqueue된 reference를 애플리케이션이 처리할 수 있습니다.

```text
referent reachability 변화
         │
         ▼
JVM reference processing
         │
         ▼
ReferenceQueue
         │
         ▼
cleanup/bookkeeping worker
```

이 구조도 정확한 시각을 보장하는 destructor는 아닙니다. GC가 언제 실행될지 자체가 애플리케이션의 즉시 제어 대상이 아니기 때문입니다.

### reference strength와 객체 ownership을 섞지 않는다

다음 질문을 먼저 해야 합니다.

> 이 객체가 살아 있어야 하는 책임은 누가 가지고 있는가?

핵심 domain state나 요청 처리에 반드시 필요한 object를 weak reference로만 보유하면 필요할 때 갑자기 사라질 수 있습니다. 반대로 단순 metadata가 원래 object의 수명을 늘려서는 안 된다면 weak 관계가 맞을 수 있습니다.

Reference type은 "GC 튜닝 꼼수"보다 **ownership semantics를 표현하는 도구**로 이해하는 편이 좋습니다.

### 문제를 풀 때 확인할 것

1. 다른 strong reference 경로가 남아 있는지 먼저 봅니다.
2. weak reference가 객체의 유일한 관계인지 확인합니다.
3. `get()` 결과가 나중에 null일 수 있음을 처리하는지 봅니다.
4. SoftReference를 명시적 cache eviction 대체재로 사용하려는지 확인합니다.
5. PhantomReference에서 원래 객체를 다시 얻으려 하지 않습니다.
6. 명시적으로 close 가능한 resource를 GC timing에 맡기지 않습니다.

### 면접에서 설명한다면

일반 reference는 strong reference라서 root에서 그 경로가 살아 있는 동안 객체를 유지합니다. `WeakReference`는 다른 strong path가 사라지면 GC가 clear할 수 있는 약한 관계이고, `SoftReference`는 메모리 상황을 고려한 더 특수한 reference지만 일반 cache 정책을 대신하기에는 제어가 어렵습니다. `PhantomReference`는 `get()`으로 객체를 되찾는 용도가 아니라 `ReferenceQueue`와 함께 수명 종료를 관찰하는 데 사용합니다.