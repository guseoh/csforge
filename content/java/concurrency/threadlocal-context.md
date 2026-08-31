---
kind: concept
contentKey: java.core.concurrency.threadlocal-context
topicContentKey: java.core.concurrency
slug: threadlocal-context
title: "ThreadLocal context"
summary: "ThreadLocal이 값을 thread별로 보관하는 방식과 thread pool 재사용·remove·비동기 경계에서 생기는 문제를 이해한다"
level: 3
status: PUBLISHED
displayOrder: 160
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html"
    title: "Java SE 25 API: ThreadLocal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: thread별 값과 remove 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Java thread와 virtual thread 관련 API 경계 확인
---
# ThreadLocal은 왜 편리하면서도 위험할까

여러 계층의 메서드가 현재 요청의 ID나 사용자 정보를 필요로 하는데 모든 메서드 인자로 계속 넘기고 싶지 않을 때가 있습니다. `ThreadLocal`은 이런 값을 **현재 thread에 연결해서 보관**할 수 있게 합니다.

같은 `ThreadLocal` 객체를 사용해도 thread가 다르면 서로 다른 값을 읽을 수 있습니다.

### 같은 변수처럼 보여도 thread마다 값이 다르다

```java
private static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();

REQUEST_ID.set("req-1");
String id = REQUEST_ID.get();
```

개념적으로는 다음처럼 생각할 수 있습니다.

```text
Thread A -> REQUEST_ID = "req-A"
Thread B -> REQUEST_ID = "req-B"
```

`ThreadLocal` 자체가 thread마다 새로 만들어지는 것은 아닙니다. 같은 `ThreadLocal` key를 각 thread가 자기 값과 연결해 사용하는 모델입니다.

그래서 일반 static field처럼 모든 thread가 하나의 값을 공유하는 것과 다릅니다.

### 요청 단위 값은 반드시 생명주기를 끝내야 한다

서버의 platform thread pool에서는 하나의 worker thread가 요청 하나만 처리하고 사라지는 것이 아닙니다. 요청 A를 처리한 thread가 나중에 요청 B도 처리할 수 있습니다.

```text
worker-1
  ├─ Request A -> ThreadLocal = userA
  └─ Request B -> 같은 worker 재사용
```

A가 끝날 때 값을 지우지 않았다면 B가 이전 값을 잘못 보거나, 큰 객체가 thread와 함께 오래 남을 수 있습니다.

그래서 요청 경계에서는 보통 다음과 같이 정리합니다.

```java
void handle(Request request) {
    CURRENT.set(createContext(request));
    try {
        service();
    } finally {
        CURRENT.remove();
    }
}
```

`set(null)`과 `remove()`를 같은 의미라고 막연히 생각하기보다 API가 제공하는 정리 동작을 사용합니다.

### thread가 바뀌면 값이 자동으로 따라가지 않는다

```java
CURRENT.set(context);

executor.submit(() -> {
    // 다른 worker thread라면 CURRENT.get()이 같은 값을 돌려준다고 가정할 수 없음
});
```

`CompletableFuture`, `@Async`, 별도 executor 같은 비동기 경계를 넘으면 실행 thread가 바뀔 수 있습니다. `ThreadLocal`은 "논리적인 요청"에 값을 붙이는 것이 아니라 **실제 Java Thread에 값이 연결되는 모델**이기 때문입니다.

따라서 비동기 작업으로 context를 넘겨야 한다면:

- 필요한 값을 명시적으로 인자로 전달하거나
- framework가 제공하는 context propagation 계약을 사용하거나
- 범위가 맞는 다른 도구를 선택해야 합니다.

"ThreadLocal을 쓰고 있으니 요청 context는 어디든 따라간다"고 생각하면 안 됩니다.

### ThreadLocal은 공유 상태를 안전하게 만드는 도구가 아니다

```java
ThreadLocal<List<String>> local = new ThreadLocal<>();
```

각 thread가 서로 다른 List를 넣는다면 그 List는 보통 thread-confined하게 사용할 수 있습니다. 하지만 여러 thread가 우연히 **같은 mutable List 참조**를 ThreadLocal 값으로 넣었다면 List 자체의 공유 문제는 사라지지 않습니다.

ThreadLocal의 핵심은 값의 접근 경로를 thread별로 나누는 것이지, 객체를 복사하거나 immutable하게 만드는 것이 아닙니다.

### ThreadLocal이 메모리 누수 이야기와 함께 나오는 이유

pool worker는 오랫동안 살아 있을 수 있습니다. ThreadLocal value가 큰 object graph를 참조하고 있고 정리되지 않으면 요청은 끝났는데도 value가 계속 살아 있을 수 있습니다.

```text
long-lived worker Thread
        │
        └─ ThreadLocal value
              └─ large request graph
```

GC 관점에서는 "사용자는 끝난 요청이라고 생각하지만 여전히 도달 가능한 참조가 남아 있는" 상황입니다. 세부 구현 구조를 외우는 것보다 **thread의 수명과 context 값의 수명이 다를 수 있다**는 점을 이해하는 것이 중요합니다.

### virtual thread에서는 무엇이 달라질까

Virtual thread는 매우 많은 task를 각 thread 형태로 표현하기 쉽게 해 줍니다. task마다 새 virtual thread를 쓰는 구조에서는 전통적인 fixed platform-thread pool의 "worker가 다음 요청에 재사용되어 이전 값이 남는다"는 위험의 모습이 달라질 수 있습니다.

하지만 ThreadLocal이 공짜가 되거나 context 설계가 자동으로 해결되는 것은 아닙니다. 많은 virtual thread 각각에 큰 ThreadLocal 상태를 두면 메모리 비용이 생기고, 값 전달 방향이나 범위가 명확한 경우 Java 25의 `ScopedValue`가 더 적합할 수 있습니다.

### ThreadLocal과 ScopedValue를 문제 관점에서 구분한다

`ThreadLocal`은 현재 thread에서 값을 설정하고 나중에 변경/삭제하는 모델입니다. `ScopedValue`는 바깥 호출자가 일정 실행 범위 동안 값을 바인딩하고 안쪽 호출이 읽는 모델에 가깝습니다.

```text
ThreadLocal:  thread에 저장 -> 변경 가능 -> 직접 remove 관리
ScopedValue:  scope에 binding -> 안쪽으로 전달 -> scope 종료와 함께 끝
```

둘 중 무엇이 항상 우월한 것이 아니라 필요한 생명주기와 변경 모델을 보고 선택합니다.

### 문제를 풀 때 확인할 것

1. 값이 어떤 thread에서 `set`되고 어떤 thread에서 `get`되는지 추적합니다.
2. thread가 pool에서 재사용되는지 확인합니다.
3. 정상/예외 경로 모두에서 `remove`되는지 봅니다.
4. async/executor 경계를 넘어가는지 확인합니다.
5. ThreadLocal value 안의 객체가 실제로 공유 mutable state인지 봅니다.
6. 값의 수명이 thread보다 훨씬 짧은지 확인합니다.

### 면접에서 설명한다면

ThreadLocal은 같은 key를 사용해도 thread마다 별도의 값을 연결할 수 있는 API입니다. 요청 context처럼 편리하게 사용할 수 있지만 thread pool에서는 worker가 재사용되므로 요청 종료 시 `remove`하지 않으면 이전 요청의 값이 남거나 객체가 오래 참조될 수 있습니다. 또한 다른 executor로 실행 thread가 바뀌면 값이 자동 전파되지 않으므로 context의 생명주기와 실행 경계를 함께 설계해야 합니다.
