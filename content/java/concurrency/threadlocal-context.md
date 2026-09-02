---
kind: concept
contentKey: java.core.concurrency.threadlocal-context
topicContentKey: java.core.concurrency
slug: threadlocal-context
title: "ThreadLocal context"
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
# ThreadLocal은 왜 편리하면서도 위험할까

여러 계층의 메서드가 현재 요청의 ID나 사용자 정보를 필요로 하는데 모든 메서드 인자로 계속 넘기고 싶지 않을 때가 있습니다. `ThreadLocal`은 이런 값을 **현재 thread의 독립적인 copy로 연결해 보관**할 수 있게 합니다.

Java 25 API의 핵심 계약은 명확합니다. 같은 `ThreadLocal` 객체에 접근하더라도 각 thread는 독립적으로 초기화된 자기 값을 가집니다.

### 같은 ThreadLocal key라도 thread마다 값이 다르다

```java
private static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();

REQUEST_ID.set("req-1");
String id = REQUEST_ID.get();
```

개념적으로는 다음처럼 생각할 수 있습니다.

```text
same ThreadLocal object
     │
     ├─ Thread A -> "req-A"
     └─ Thread B -> "req-B"
```

`ThreadLocal` 객체 자체가 thread마다 복제되는 것은 아닙니다. `get()`과 `set()`이 **현재 thread의 copy**를 읽고 쓰는 API입니다.

### 값의 lifetime은 thread lifetime과 연결된다

Java API는 각 thread가 살아 있고 해당 `ThreadLocal` instance에 접근 가능한 동안 자기 thread-local copy에 대한 implicit reference를 유지한다고 설명합니다. Thread가 사라지면 다른 reference가 없는 그 copy는 GC 대상이 될 수 있습니다.

따라서 다음 두 경우를 구분해야 합니다.

```text
long-lived pooled platform thread
  -> task가 끝나도 thread는 계속 살아 있음
  -> ThreadLocal value도 남을 수 있음

one-task virtual thread
  -> task 종료와 함께 thread 자체도 종료
  -> fixed worker 재사용으로 다음 요청에 값이 넘어가는 위험은 같은 형태로 남지 않음
```

이 차이를 무시하고 모든 ThreadLocal 문제를 같은 방식으로 설명하면 안 됩니다.

### platform thread pool에서는 요청 종료 시 cleanup이 특히 중요하다

서버의 fixed platform-thread pool에서는 하나의 worker thread가 여러 요청을 순차 처리할 수 있습니다.

```text
worker-1
  ├─ Request A -> ThreadLocal = userA
  └─ Request B -> 같은 worker 재사용
```

A가 끝날 때 값을 지우지 않았다면 B가 이전 값을 잘못 보거나, 큰 객체가 worker와 함께 오래 남을 수 있습니다.

그래서 요청 범위 ThreadLocal은 일반적으로 다음처럼 수명을 닫습니다.

```java
CURRENT.set(createContext(request));
try {
    handle();
} finally {
    CURRENT.remove();
}
```

`remove()`는 현재 thread의 값을 제거합니다. 이후 같은 thread가 다시 `get()`하면 필요에 따라 `initialValue()`가 다시 호출될 수 있습니다.

### `set(null)`과 `remove()`는 완전히 같은 API 계약이 아니다

`set(null)`은 현재 thread의 copy에 null이라는 값을 저장하는 동작이고, `remove()`는 현재 thread의 값을 제거하는 동작입니다. Custom `initialValue()`나 `withInitial()`을 사용하는 경우 이후 `get()` behavior도 달라질 수 있습니다.

따라서 lifecycle 종료 의도가 있다면 `remove()`라는 명시적 API를 사용하는 편이 정확합니다.

### thread가 바뀌면 일반 ThreadLocal 값이 자동 전파되지 않는다

```java
CURRENT.set(context);

executor.submit(() -> {
    // 다른 worker라면 CURRENT.get()이 같은 값을 돌려준다고 가정할 수 없음
});
```

`CompletableFuture`, 별도 executor, `@Async` 같은 경계에서는 실행 thread가 바뀔 수 있습니다. 일반 `ThreadLocal`은 "논리적인 요청"에 값을 붙이는 기능이 아니라 **특정 Java Thread의 copy**를 제공하기 때문입니다.

`InheritableThreadLocal`은 별도의 inheritance 규칙을 가지지만 그것도 arbitrary async context propagation과 같은 계약은 아닙니다.

### ThreadLocal은 mutable 객체를 thread-safe하게 만들지 않는다

```java
ThreadLocal<List<String>> local = new ThreadLocal<>();
```

각 thread가 서로 다른 List를 넣으면 자연스럽게 thread-confined하게 사용할 수 있습니다. 하지만 여러 thread가 같은 mutable List reference를 각각 자기 ThreadLocal 값으로 넣었다면 List 자체의 공유 문제는 그대로입니다.

ThreadLocal은 **접근 슬롯을 thread별로 나누는 것**이지 객체를 복사하거나 immutable하게 만드는 기능이 아닙니다.

### virtual thread에서는 fixed-worker leakage와 다른 문제가 더 중요해진다

Task마다 새 virtual thread를 사용하는 구조에서는 전통적인 fixed worker 재사용 때문에 요청 A의 값이 요청 B로 넘어가는 위험은 크게 달라집니다. Task가 끝나면 그 virtual thread도 끝나기 때문입니다.

그렇다고 ThreadLocal 사용 비용을 무시해도 된다는 뜻은 아닙니다. Virtual thread는 매우 많이 존재할 수 있으므로 각 thread마다 큰 상태를 두면 전체 memory footprint가 커질 수 있습니다.

특히 platform thread 시대에 사용하던 다음 패턴은 virtual thread와 잘 맞지 않을 수 있습니다.

```text
ThreadLocal
  └─ expensive reusable object cache
```

Platform worker 수가 작을 때는 object 개수도 작게 제한됐지만, task마다 virtual thread를 만들면 reusable object를 thread마다 하나씩 만들 가능성이 생깁니다. Virtual-thread 가이드도 이런 ThreadLocal cache 패턴을 피하고, context 전달이라면 ScopedValue를 검토하도록 안내합니다.

### ThreadLocal과 ScopedValue는 전달 방향과 lifetime이 다르다

`ThreadLocal`은 현재 thread가 값을 `set`하고 변경하고 `remove`할 수 있는 thread-bound storage입니다.

`ScopedValue`는 바깥 caller가 일정 dynamic scope 동안 값을 바인딩하고 안쪽 호출이 읽는 **one-way transmission**에 맞게 설계되었습니다. Java 25 ScopedValue API도 이 목적이라면 ThreadLocal보다 ScopedValue를 선호하도록 안내합니다.

```text
ThreadLocal
thread copy 생성
   ├─ set/change 가능
   └─ lifetime을 직접 관리

ScopedValue
outer caller binds
   └─ bounded dynamic scope 안쪽에서 읽음
```

둘 중 무엇이 항상 우월한 것이 아니라 필요한 변경 모델과 lifetime을 보고 선택합니다.

### 문제를 풀 때 확인할 것

1. 값이 어느 thread에서 set/get되는지 추적합니다.
2. platform thread가 pool에서 재사용되는지 확인합니다.
3. 요청보다 thread lifetime이 더 긴지 봅니다.
4. 종료 의도라면 정상·예외 경로에서 `remove()`되는지 확인합니다.
5. async/executor에서 thread가 바뀌는지 봅니다.
6. ThreadLocal value 안의 객체가 실제로 shared mutable state인지 따로 확인합니다.
7. virtual thread마다 큰 reusable cache를 만들고 있지 않은지 봅니다.
8. one-way context 전달이면 ScopedValue가 더 맞는지 검토합니다.

### 자주 헷갈리는 부분

- 같은 ThreadLocal 객체라도 thread마다 independent copy를 가집니다.
- 일반 ThreadLocal 값이 다른 executor thread로 자동 전파되는 것은 아닙니다.
- `remove()`와 `set(null)`은 API semantics가 완전히 같지 않습니다.
- per-task virtual thread에서는 fixed worker stale-context 문제의 형태가 달라집니다.
- 그렇다고 millions of virtual threads에 큰 ThreadLocal cache를 두는 것이 공짜는 아닙니다.
- ThreadLocal이 내부 mutable 객체를 자동으로 thread-safe하게 만들지 않습니다.

### 면접에서 설명한다면

ThreadLocal은 같은 key를 사용해도 각 thread가 독립적인 값을 갖게 하는 API입니다. Long-lived platform thread pool에서는 요청 종료 후 `remove()`하지 않으면 다음 task가 stale context를 보거나 객체가 오래 retain될 수 있습니다. Per-task virtual thread에서는 worker 재사용 문제의 형태는 줄지만, 매우 많은 thread마다 큰 ThreadLocal 상태나 reusable cache를 두면 메모리 비용이 커질 수 있습니다. 또한 일반 ThreadLocal은 다른 executor thread로 자동 전파되지 않으며, one-way bounded context 전달이라면 Java 25의 ScopedValue를 검토할 수 있습니다.
