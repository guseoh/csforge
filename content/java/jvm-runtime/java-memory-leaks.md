---
kind: concept
contentKey: java.core.jvm-runtime.java-memory-leaks
topicContentKey: java.core.jvm-runtime
slug: java-memory-leaks
title: "Java 메모리 누수의 원인"
summary: "GC가 있어도 더 이상 필요하지 않은 객체가 cache·listener·ThreadLocal 등의 참조 때문에 reachable하게 남으면 memory leak이 될 수 있음을 진단한다"
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
# Java 메모리 누수의 원인

Java에는 GC가 있지만 memory leak은 여전히 생길 수 있습니다. GC는 "애플리케이션이 더 이상 필요로 하지 않는 객체"를 의미적으로 판단하지 않습니다. **살아 있는 root에서 더 이상 도달할 수 없는 객체**를 회수할 수 있을 뿐입니다.

따라서 업무적으로는 이미 버려야 하는 객체라도 cache, listener, ThreadLocal 같은 장수 owner가 계속 참조하면 GC는 그 객체를 정상적으로 보존합니다.

![GC root부터 불필요한 객체까지 남아 있는 retained path](/learning/java/java-memory-retained-path.svg)

### Leak의 핵심은 불필요한 객체가 아직 reachable하다는 것이다

```java
private static final Map<String, byte[]> CACHE = new HashMap<>();

void remember(String id, byte[] payload) {
    CACHE.put(id, payload);
}
```

삭제 정책이 없다면 static map이 모든 payload를 계속 붙잡습니다.

```text
GC Root
   │
static CACHE
   │
   ├─ payload A
   ├─ payload B
   └─ payload C ...
```

GC 입장에서는 이 객체들이 여전히 reachable하므로 회수하면 안 됩니다. 문제는 collector가 아니라 **owner와 lifecycle 정책**입니다.

### 큰 객체보다 retained path를 찾는다

Heap dump에서 500MB짜리 object를 발견했다고 바로 root cause를 찾은 것은 아닙니다. 중요한 질문은 다음입니다.

> 어떤 살아 있는 owner가 이 객체를 계속 붙잡고 있는가?

```text
GC Root
  │
Registry
  │
Listener
  │
Session
  │
large byte[]
```

작은 `Map`이나 listener 하나가 거대한 object graph 전체의 수명을 연장할 수도 있습니다. 그래서 shallow size보다 retained relation이 더 중요한 경우가 많습니다.

### 흔한 원인은 장수 owner와 짧은 객체 수명의 불일치다

대표적인 패턴은 다음과 같습니다.

**Cache**는 최대 크기, TTL, eviction이 없으면 workload가 늘수록 계속 커질 수 있습니다.

**Listener/Subscriber**는 등록만 하고 해제하지 않으면 publisher가 listener와 그 뒤의 object graph를 계속 보유할 수 있습니다.

**ThreadLocal**은 long-lived platform thread pool에서 요청이 끝난 뒤 `remove()`하지 않으면 이전 요청 context가 worker thread와 함께 오래 남을 수 있습니다.

```java
CTX.set(context);
try {
    handle();
} finally {
    CTX.remove();
}
```

**ClassLoader**는 reload/plugin 환경에서 이전 loader를 thread, ThreadLocal, registry가 계속 참조하면 그 loader가 정의한 class와 metadata까지 함께 오래 유지할 수 있습니다.

### Queue 증가와 leak을 구분한다

```text
producer 1000/s
consumer  100/s
```

Unbounded queue라면 task가 초당 900개씩 증가할 수 있습니다. Heap이 계속 커진다는 증상은 memory leak과 비슷하지만 원인은 "참조를 잘못 해제함"보다 **처리 capacity보다 유입이 큰 overload/backlog**일 수 있습니다.

그래서 메모리 증가를 볼 때는 object graph뿐 아니라 queue length, request rate, 처리량도 함께 봅니다.

### GC가 자주 돈다고 leak이 확정되는 것은 아니다

Heap 증가와 GC 빈도 증가는 다음 원인에서도 나타날 수 있습니다.

- 정상적인 workload 증가
- 순간적인 allocation burst
- cache warm-up
- queue backlog
- 실제 live set 증가
- memory leak

Leak을 의심한다면 여러 시점의 heap usage, class histogram, heap dump를 비교해 특정 object 종류와 retained path가 지속적으로 증가하는지 봅니다. Full GC 이후에도 live set이 계속 상승하는 것은 중요한 단서지만 그 자체가 root cause를 증명하지는 않습니다.

### 해결은 WeakReference보다 ownership 수정이 먼저다

Leak을 발견했다고 모든 reference를 weak하게 바꾸면 원래 필요한 객체까지 예측할 수 없는 시점에 사라질 수 있습니다.

먼저 다음을 정합니다.

- 누가 이 객체의 owner인가?
- 객체 수명은 언제 끝나는가?
- 누가 remove/unregister/close하는가?
- cache는 어떤 크기와 TTL을 가져야 하는가?
- queue는 어떤 capacity와 overload 정책을 가져야 하는가?

Reference type 변경은 실제 관계가 "이 참조 때문에 객체 수명을 연장하면 안 된다"는 의미일 때만 검토합니다.

### 정리

Java memory leak은 GC가 동작하지 않아서가 아니라, 업무적으로 불필요해진 객체가 여전히 root에서 reachable하게 남아 있는 문제인 경우가 많습니다. Static cache, listener, ThreadLocal, queue, ClassLoader처럼 장수 owner를 확인하고, heap dump에서는 큰 객체 하나보다 GC root까지의 retained path를 추적해야 합니다. 해결도 `System.gc()`나 WeakReference부터 적용하기보다 owner와 lifecycle 정책을 바로잡는 것이 먼저입니다.
