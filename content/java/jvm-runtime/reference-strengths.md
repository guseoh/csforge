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

일반 Java 변수로 객체를 가리키면 보통 strong reference입니다. 이런 강한 참조 경로가 살아 있는 실행에서 이어져 있으면 GC는 그 객체를 회수 대상으로 다루지 않습니다.

그런데 cache나 metadata처럼 "이 참조 때문에 객체를 꼭 살려 둘 필요는 없다"는 관계도 있습니다. Java의 `java.lang.ref`는 이런 관계를 표현하기 위해 soft, weak, phantom reference를 제공합니다.

### strong reference가 기본이다

```java
User user = new User();
```

`user`가 live한 strong reference이고 그 참조를 통해 객체에 접근할 수 있다면 객체는 strongly reachable합니다.

```text
live computation ──▶ strong ref ──▶ User
```

일반 객체 ownership은 대부분 strong reference로 표현합니다. 다른 reference type은 특별한 수명 정책이 필요할 때만 사용합니다.

### WeakReference는 "이 참조 하나 때문에 살려 두지는 않겠다"에 가깝다

```java
WeakReference<User> weak = new WeakReference<>(user);
```

객체가 strong이나 soft reference로는 도달할 수 없고 weak reference를 통해서만 도달할 수 있는 **weakly reachable** 상태가 되었다고 GC가 판단하면, Java API 계약상 해당 객체에 대한 weak reference들과 관련 weakly-reachable graph의 weak reference를 원자적으로 clear합니다. 등록된 `ReferenceQueue`가 있다면 clear된 reference는 같은 시점 또는 이후에 enqueue됩니다.

```text
strong path 있음
live path ──▶ User             -> strongly reachable

strong/soft path 사라짐
WeakReference ──▶ User         -> weakly reachable
                                  GC가 weak reference clear
```

따라서 `WeakReference.get()`은 referent가 아직 남아 있으면 값을 줄 수 있지만, GC의 reference processing 뒤에는 `null`이 될 수 있습니다. Weak reference를 사용한 코드는 **referent의 존재를 애플리케이션 수명 계약처럼 가정하지 않아야 합니다.**

### weak reference의 대표적인 용도는 보조 관계다

예를 들어 어떤 object에 대한 metadata를 저장하지만 metadata map 때문에 원래 object의 수명이 늘어나면 안 되는 상황이 있습니다. 이런 문제에 weak reference 기반 구조가 사용될 수 있습니다.

Java의 `WeakHashMap`도 key가 일반 strong reference가 아니라 weak 관계를 가지는 특수한 map입니다.

하지만 "메모리 절약이 필요하니 모든 map을 WeakHashMap으로 바꾼다"는 식으로 사용하면 안 됩니다. entry의 수명은 application TTL이 아니라 reachability와 GC processing의 영향을 받기 때문입니다.

### SoftReference는 weak보다 강한 reachability지만 cache TTL이 아니다

Soft reference는 객체가 strongly reachable하지 않지만 soft reference를 통해 도달할 수 있는 **softly reachable** 상태를 표현합니다. GC는 memory demand에 대응해 soft reference를 재량에 따라 clear할 수 있습니다.

여기에는 중요한 계약이 하나 있습니다. JVM이 `OutOfMemoryError`를 던지기 전에는 softly-reachable 객체를 가리키는 모든 soft reference가 clear되어 있어야 합니다. 반대로 **언제 어떤 soft reference를 먼저 clear할지에 대한 일반적인 시간·순서 보장은 없습니다.**

```text
SoftReference ──▶ object
      │
      ├─ memory demand에 따라 GC가 clear할 수 있음
      └─ OOME 전에는 softly-reachable referent의 soft reference가 clear되어야 함
```

과거에는 "메모리가 부족하면 자동으로 지워지는 cache"라는 설명으로 많이 소개됐지만, 이 규칙은 TTL·최대 entry 수·LRU 같은 application cache 정책을 제공하지 않습니다.

애플리케이션 cache에는 보통 다음이 더 중요합니다.

- 최대 entry 수/메모리 크기
- TTL
- access pattern
- 명시적인 eviction
- stale 허용 범위
- hit/miss 관찰

SoftReference만으로는 정확히 언제 어떤 entry가 사라질지 애플리케이션이 통제하기 어렵습니다.

### PhantomReference는 객체를 다시 얻는 참조가 아니다

`PhantomReference`는 다른 reference와 목적이 다릅니다.

```java
ReferenceQueue<Resource> queue = new ReferenceQueue<>();
PhantomReference<Resource> phantom =
        new PhantomReference<>(resource, queue);
```

GC가 객체를 phantom reachable하다고 판단하면 관련 phantom reference를 원자적으로 clear하고, queue가 등록되어 있다면 같은 시점 또는 이후에 enqueue합니다. Phantom reference의 `get()`은 항상 `null`을 반환하므로 원래 객체를 되찾아 다시 사용하는 용도가 아닙니다.

ReferenceQueue와 함께 사용해 **referent가 수명 종료 단계에 들어갔음을 관찰하고 post-mortem cleanup bookkeeping을 예약하는 용도**와 연결됩니다.

Native resource 관리 같은 특별한 경우에는 `Cleaner` 등 더 높은 수준 API를 검토할 수 있습니다. 그래도 파일이나 socket 같은 자원은 가능하면 `try-with-resources`처럼 deterministic한 명시적 close가 우선입니다.

### ReferenceQueue를 쓰려면 Reference 객체 자체의 수명도 관리해야 한다

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

하지만 queue가 등록된 `Reference` 객체를 대신 강하게 보관해 주는 것은 아닙니다. Java API는 **프로그램이 referent의 상태 변화에 관심을 가지는 동안 Reference 객체 자체도 reachable하게 유지할 책임이 프로그램에 있다**고 명시합니다. Reference 객체가 먼저 unreachable해지면 해당 notification을 기대할 수 없습니다.

또 이 구조는 정확한 시각을 보장하는 destructor가 아닙니다. GC와 reference processing이 언제 일어날지는 애플리케이션이 즉시 제어하는 lifecycle callback이 아니기 때문입니다.

### reference strength와 객체 ownership을 섞지 않는다

다음 질문을 먼저 해야 합니다.

> 이 객체가 살아 있어야 하는 책임은 누가 가지고 있는가?

핵심 domain state나 요청 처리에 반드시 필요한 object를 weak reference로만 보유하면 필요할 때 referent가 사라질 수 있습니다. 반대로 단순 metadata가 원래 object의 수명을 늘려서는 안 된다면 weak 관계가 맞을 수 있습니다.

Reference type은 "GC 튜닝 꼼수"보다 **ownership과 reachability semantics를 표현하는 도구**로 이해하는 편이 좋습니다.

### 문제를 풀 때 확인할 것

1. 다른 strong reference 경로가 남아 있는지 먼저 봅니다.
2. soft/weak/phantom 중 어떤 reachability 단계인지 구분합니다.
3. WeakReference의 referent가 weakly reachable해지면 GC가 관련 weak reference를 clear한다는 계약을 확인합니다.
4. SoftReference의 OOME 전 clear 보장과, 그 외 clear 시각·순서는 미정이라는 점을 구분합니다.
5. `get()` 결과가 나중에 null일 수 있음을 처리하는지 봅니다.
6. PhantomReference에서 원래 객체를 다시 얻으려 하지 않습니다.
7. ReferenceQueue를 사용하면 Reference 객체 자체도 필요한 기간 동안 reachable하게 유지합니다.
8. 명시적으로 close 가능한 resource를 GC timing에 맡기지 않습니다.

### 면접에서 설명한다면

일반 reference는 strong reference라서 live computation에서 그 경로가 살아 있는 동안 객체를 유지합니다. `WeakReference`는 객체가 weakly reachable해졌다고 GC가 판단하면 관련 weak reference가 clear되는 약한 관계입니다. `SoftReference`는 그보다 강한 reachability로 memory demand에 따라 clear되며, JVM이 OOME를 던지기 전에는 softly-reachable 객체의 soft reference가 clear되어야 하지만 일반적인 clear 시각이나 순서는 보장되지 않습니다. `PhantomReference`는 `get()`으로 객체를 되찾는 용도가 아니라 `ReferenceQueue`와 함께 post-mortem cleanup을 관찰·예약하는 데 사용합니다.
