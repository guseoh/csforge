---
kind: concept
contentKey: java.core.jvm-runtime.reference-strengths
topicContentKey: java.core.jvm-runtime
slug: reference-strengths
title: "강한·소프트·약한·팬텀 참조"
summary: "강한 참조와 SoftReference·WeakReference·PhantomReference가 객체의 도달 가능성과 수명에 어떤 영향을 주는지 구분하고 캐시나 정리 정책에 남용하지 않는다"
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/package-summary.html"
    title: "Java SE 25 API: java.lang.ref"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 참조 강도와 reachability 처리 개요 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/PhantomReference.html"
    title: "PhantomReference (Java SE 25 API)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: PhantomReference와 ReferenceQueue 사용 확인
  - url: "https://d2.naver.com/helloworld/329631"
    title: "네이버 D2: Java Reference와 GC"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: 강한·소프트·약한·팬텀 참조의 학습 흐름 보충
---
# 강한·소프트·약한·팬텀 참조

일반적인 Java 참조는 객체를 **강하게 도달 가능한 상태(strongly reachable)** 로 유지합니다. 하지만 메타데이터나 보조 캐시처럼 **이 참조 관계 때문에 객체의 본래 수명이 불필요하게 늘어나서는 안 되는 경우**도 있습니다. `java.lang.ref`는 이런 관계를 표현하기 위해 `SoftReference`, `WeakReference`, `PhantomReference`를 제공합니다.

핵심은 "GC를 조종하는 특수 포인터"라고 외우는 것이 아니라 **각 참조가 객체의 도달 가능성과 수명에 어떤 영향을 주는가**를 이해하는 것입니다.

### 강한 참조(Strong Reference)가 기본이다

```java
User user = new User();
```

살아 있는 루트에서 일반적인 강한 참조 경로가 객체까지 이어지면 그 객체는 strongly 도달 가능한합니다.

```text
살아 있는 GC 루트 ──▶ owner ──▶ User
```

업무 처리에 반드시 필요한 객체는 보통 이런 강한 참조 관계로 보유합니다. 일반 지역 변수나 필드가 객체를 직접 참조하고 있다면 특별한 `Reference` 객체로 감싸지 않은 한 기본적으로 이 관계를 생각하면 됩니다.

### 약한 참조(Weak Reference)는 객체 수명을 강하게 연장하지 않는다

```java
WeakReference<User> weak = new WeakReference<>(user);
```

객체가 강한 참조나 소프트 참조로는 더 이상 도달되지 않고 `WeakReference`를 통해서만 도달 가능한 weakly 도달 가능한 상태가 되면, JVM의 참조 처리 과정에서 해당 약한 참조는 지워질 수 있습니다.

```text
강한 참조 경로 존재
GC 루트 ──▶ User

강한/소프트 참조 경로 소멸
WeakReference ──▶ User
                   │
                   └─ 약한 참조로 도달 가능(weakly reachable)
```

따라서 `weak.get()`은 어느 시점에는 객체를 반환하다가 이후 `null`을 반환할 수 있습니다. 반드시 살아 있어야 하는 업무 상태라면 약한 참조만으로 보유하면 안 됩니다.

약한 참조는 원본 객체의 수명을 늘리지 않아야 하는 메타데이터 관계나 `WeakHashMap` 같은 특수한 구조에서 사용할 수 있습니다.

### 소프트 참조(Soft Reference)는 애플리케이션 캐시 정책을 대신하지 않는다

소프트 참조는 강한 참조는 없지만 `SoftReference`를 통해 도달 가능한 객체를 표현합니다. JVM은 메모리 수요에 따라 소프트 참조를 지울 수 있으며, Java API는 `OutOfMemoryError`를 던지기 전에 소프트 참조로만 도달 가능한 객체에 대한 소프트 참조가 지워져야 한다는 중요한 보장을 둡니다.

반면 **언제 어떤 소프트 참조를 먼저 지우는지에 대한 TTL·LRU·순서 계약은 없습니다.**

```text
SoftReference 기반 캐시
   ├─ TTL 보장 없음
   ├─ 최대 항목 수 보장 없음
   └─ 제거 순서 보장 없음
```

그래서 일반 애플리케이션 캐시에는 최대 크기, TTL, 명시적인 제거 정책, hit/miss 관찰처럼 업무 정책을 표현할 수 있는 캐시 추상화가 더 적합한 경우가 많습니다.

### 팬텀 참조(Phantom Reference)는 객체를 다시 꺼내는 참조가 아니다

```java
ReferenceQueue<Resource> queue = new ReferenceQueue<>();
PhantomReference<Resource> phantom =
        new PhantomReference<>(resource, queue);
```

`PhantomReference.get()`은 항상 `null`을 반환합니다. 목적은 참조 대상 객체를 다시 사용하기 위한 것이 아니라 객체가 phantom 도달 가능한 단계에 들어간 뒤 `ReferenceQueue`와 함께 **수명 종료 이후의 정리 작업이나 bookkeeping 시점을 관찰하는 것**입니다.

이것도 결정적인 소멸자(deterministic destructor)는 아닙니다. GC와 참조 처리 시점을 애플리케이션이 정확히 지정할 수 없으므로 파일이나 소켓 같은 자원은 가능하면 `try-with-resources`와 명시적인 `close()`가 우선입니다.

### ReferenceQueue를 쓰면 Reference 객체 자체의 수명도 관리해야 한다

참조를 큐에 등록했다고 해서 큐가 해당 `Reference` 객체의 수명을 대신 보장하는 것은 아닙니다. 알림을 처리할 필요가 있는 동안에는 프로그램이 `Reference` 객체 자체도 도달 가능한 상태로 유지해야 합니다.

```text
참조 대상의 도달 가능성 변화
        │
        ▼
참조 처리(reference processing)
        │
        ▼
ReferenceQueue
        │
        ▼
정리·관리 작업
```

이 점을 놓치면 "큐에 등록했는데 왜 알림을 못 받았지?" 같은 잘못된 기대를 만들 수 있습니다.

### 참조 종류를 고를 때는 객체의 수명을 누가 책임지는지부터 묻는다

참조 종류를 선택하기 전에 먼저 다음 질문을 합니다.

> 이 객체가 계속 살아 있어야 할 책임은 누가 가지고 있는가?

- 반드시 살아 있어야 한다면 강한 참조 관계가 필요합니다.
- 이 관계 때문에 원본 객체의 수명이 늘어나면 안 된다면 `WeakReference`를 검토할 수 있습니다.
- 메모리 상황에 민감한 보조 캐시라도 `SoftReference` 하나로 캐시 정책 전체를 대체하지 않습니다.
- 수명 종료 이후의 정리 시점을 관찰해야 한다면 `PhantomReference`와 `ReferenceQueue`, 또는 더 높은 수준의 API를 검토합니다.

### 정리

강한 참조는 객체를 일반적으로 살아 있게 유지하는 기본 참조 관계입니다. `WeakReference`는 원본 객체의 수명을 강하게 연장하지 않는 관계에 적합하고, `SoftReference`는 메모리 상황에 따라 지워질 수 있지만 TTL이나 제거 정책을 제공하지 않습니다. `PhantomReference`는 참조 대상 객체를 다시 얻는 API가 아니라 `ReferenceQueue`와 함께 수명 종료 이후를 관찰하는 도구입니다. 참조 강도는 GC 꼼수보다 **객체의 도달 가능성과 수명 책임을 표현하는 개념**으로 이해하는 것이 중요합니다.
