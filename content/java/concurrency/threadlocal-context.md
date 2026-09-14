---
kind: concept
contentKey: java.core.concurrency.threadlocal-context
topicContentKey: java.core.concurrency
slug: threadlocal-context
title: "ThreadLocal과 실행 문맥"
summary: "ThreadLocal이 값을 thread별로 보관하는 방식과 thread pool 재사용·remove·virtual thread·비동기 경계에서 생기는 문제를 이해한다"
level: 3
status: PUBLISHED
displayOrder: 160
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html"
    title: "Java SE 25 API: ThreadLocal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: thread별 값과 remove·thread lifetime 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Java thread와 virtual thread 관련 API 경계 확인
---
# ThreadLocal과 실행 문맥

요청 ID처럼 같은 실행 흐름의 여러 계층에서 읽어야 하지만 모든 메서드 매개변수로 반복해서 전달하고 싶지 않은 값이 있습니다. `ThreadLocal`은 **같은 ThreadLocal key를 사용해도 각 Java thread가 자기 값을 갖게 하는 storage**입니다.

```java
private static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();
```

```text
same ThreadLocal object
      │
      ├─ Thread A -> "req-A"
      └─ Thread B -> "req-B"
```

ThreadLocal 객체가 thread마다 복제되는 것이 아니라, `get()`과 `set()`이 현재 thread에 연결된 값을 다룹니다.

### 값의 lifetime은 thread lifetime과 연결된다

```java
REQUEST_ID.set("req-1");
try {
    handleRequest();
} finally {
    REQUEST_ID.remove();
}
```

ThreadLocal 값을 현재 작업보다 오래 남겨서는 안 되는 경우 `remove()`로 수명을 명시적으로 닫는 것이 중요합니다.

특히 platform thread pool에서는 한 worker가 여러 요청을 순서대로 처리할 수 있습니다.

```text
worker-1
  ├─ Request A -> REQUEST_ID = A
  └─ Request B -> 같은 worker 재사용
```

A가 끝날 때 값을 제거하지 않으면 B가 stale context를 읽거나, A에서 보관한 큰 객체가 long-lived worker와 함께 오래 유지될 수 있습니다.

`set(null)`과 `remove()`도 같은 API가 아닙니다. `remove()`는 현재 thread의 entry를 제거하고, 이후 `get()` 시 `initialValue()`가 다시 적용될 수 있습니다.

### Thread가 바뀌면 일반 ThreadLocal 값도 자동으로 따라가지 않는다

```java
REQUEST_ID.set("req-1");

executor.submit(() -> {
    // 다른 worker에서는 같은 값을 자동으로 본다고 가정할 수 없음
});
```

ThreadLocal은 "논리적인 요청"에 값을 붙이는 기능이 아니라 **현재 Java thread에 값을 연결하는 기능**입니다. `CompletableFuture`나 별도 executor로 실행 thread가 바뀌면 일반 ThreadLocal 값이 자동 전파된다고 기대할 수 없습니다.

`InheritableThreadLocal`은 thread 생성 시 별도 inheritance 규칙을 가지지만 arbitrary async 작업의 범용 context propagation 계약은 아닙니다.

### ThreadLocal 안의 값이 공유 객체라면 그 객체의 race는 그대로다

```java
List<String> shared = new ArrayList<>();

localA.set(shared);
localB.set(shared);
```

두 thread가 서로 다른 ThreadLocal slot을 사용해도 값이 같은 mutable object reference라면 그 객체 자체는 여전히 공유됩니다. ThreadLocal은 값을 복사하거나 immutable하게 만들지 않습니다.

```text
Thread A local ──┐
                 ├──> same mutable List
Thread B local ──┘
```

### Virtual thread에서는 fixed-worker leakage와 자원 비용을 나눠 본다

Task마다 새 virtual thread를 만드는 구조에서는 long-lived fixed worker가 다음 요청에 stale ThreadLocal 값을 넘기는 문제의 형태가 달라집니다. Task가 끝나면 virtual thread 자체도 끝나기 때문입니다.

하지만 virtual thread를 매우 많이 만들 수 있으므로 각 thread마다 크고 비싼 reusable object를 ThreadLocal cache로 두면 전체 메모리 사용량이 커질 수 있습니다.

```text
platform pool 시대
small worker count × per-thread cache

virtual thread-per-task
very many threads × per-thread cache
```

따라서 virtual thread 환경에서는 ThreadLocal이 "지원되는가"와 "이 값을 thread마다 하나씩 두는 것이 좋은 자원 모델인가"를 구분해야 합니다.

### One-way context라면 ScopedValue와 목적을 비교한다

ThreadLocal은 같은 thread 안에서 값을 `set`, 변경, `remove`할 수 있는 mutable thread-bound storage입니다. Java 25의 `ScopedValue`는 caller가 제한된 dynamic scope 동안 값을 바인딩하고 callee가 읽는 **one-way context transmission**에 맞게 설계되었습니다.

```text
ThreadLocal
thread-bound mutable slot
set -> get -> set/remove

ScopedValue
outer caller binds
      -> inner call chain reads
      -> scope 종료 시 이전 binding 복원
```

모든 ThreadLocal을 ScopedValue로 바꿔야 한다는 뜻은 아닙니다. 목적이 thread-specific mutable state인지, bounded one-way context인지에 따라 선택합니다.

ThreadLocal 문제를 볼 때는 **누가 set하는가, 같은 thread가 얼마나 오래 사는가, 작업 종료 시 remove되는가, async 경계에서 thread가 바뀌는가, 저장된 object 자체가 공유 mutable state인가**를 순서대로 확인하세요. ThreadLocal의 핵심 위험은 API 자체보다 값의 수명과 실제 thread 경계를 잘못 가정할 때 드러납니다.
