---
kind: concept
contentKey: java.core.jvm-runtime.java-memory-leaks
topicContentKey: java.core.jvm-runtime
slug: java-memory-leaks
title: "Java memory leaks"
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
# GC가 있는데도 memory leak은 왜 생길까

Java에는 GC가 있으니 memory leak이 없을 것처럼 느껴질 수 있습니다. 하지만 GC가 하는 일은 **더 이상 reachable하지 않은 객체를 회수하는 것**입니다. 애플리케이션이 이미 필요 없다고 생각하는 객체라도 살아 있는 참조 경로가 남아 있으면 GC는 정상적으로 그 객체를 보존합니다.

그래서 Java memory leak은 보통 "GC가 객체를 못 지운다"보다 **필요 없는 객체를 코드가 계속 reachable하게 붙잡고 있다**는 문제입니다.

### 가장 단순한 leak은 끝없이 커지는 장수 collection이다

```java
private static final Map<String, byte[]> CACHE = new HashMap<>();

void remember(String id, byte[] payload) {
    CACHE.put(id, payload);
}
```

entry를 삭제하는 정책이 없다면:

```text
static CACHE
   │
   ├─ id1 -> payload 1
   ├─ id2 -> payload 2
   ├─ id3 -> payload 3
   └─ ... 계속 증가
```

모든 payload는 static cache를 통해 reachable합니다. GC 입장에서는 회수하면 안 되는 정상적인 객체입니다.

문제는 애플리케이션 정책에 TTL, 최대 크기, eviction이 없다는 것입니다.

### memory leak의 핵심 질문은 "왜 아직 reachable한가"다

Heap dump에서 큰 객체 하나를 발견했다고 바로 원인이 밝혀진 것은 아닙니다.

예를 들어 500MB짜리 byte array가 있다고 해도 중요한 질문은:

> 누가 이 객체를 계속 붙잡고 있는가?

입니다.

```text
GC Root
  │
  ▼
static Registry
  │
  ▼
Listener
  │
  ▼
Session
  │
  ▼
large byte[]
```

이 retained path를 따라가야 ownership 문제를 찾을 수 있습니다.

### listener를 등록하고 해제하지 않는 것도 흔한 패턴이다

```java
publisher.addListener(component);
```

Publisher가 애플리케이션 전체 수명 동안 살아 있고 component는 화면/작업 종료 후 더 이상 필요하지 않다고 해 보겠습니다.

등록 해제를 하지 않으면:

```text
long-lived Publisher
        │
        └─ listener list
              └─ component
                    └─ object graph
```

가 남습니다.

따라서 listener/subscriber lifecycle은 등록 시점뿐 아니라 **언제 끊을 것인가**까지 설계해야 합니다.

### ThreadLocal은 thread pool과 함께 leak 원인이 될 수 있다

```java
private static final ThreadLocal<RequestContext> CTX = new ThreadLocal<>();
```

요청 시작 시 `set`하고 끝날 때 `remove`하지 않았다고 해 보겠습니다.

```text
long-lived worker thread
        │
        └─ ThreadLocal value
              └─ RequestContext
                    └─ request graph
```

Fixed thread pool worker는 다음 요청에도 재사용될 수 있으므로 이전 요청의 객체가 오래 살아 있을 수 있습니다.

그래서 요청 범위 ThreadLocal은 보통:

```java
CTX.set(context);
try {
    handle();
} finally {
    CTX.remove();
}
```

처럼 정리합니다.

### unbounded queue도 memory growth의 원인이 될 수 있다

Executor나 producer-consumer 구조에서 처리 속도보다 유입 속도가 계속 빠르고 queue가 무제한이라면 task 객체가 계속 쌓일 수 있습니다.

```text
producer 1000/s
consumer  100/s

queue +900/s
```

이것은 전통적인 "참조를 잘못 해제하지 않은 leak"과 조금 다른 overload 문제일 수 있지만, 운영에서는 heap이 계속 증가하는 비슷한 증상으로 나타납니다.

그래서 leak 진단에서는 객체 종류와 retained path뿐 아니라 **queue 길이, workload, 처리 속도**도 함께 봅니다.

### ClassLoader leak은 redeploy/plugin 환경에서 중요하다

애플리케이션을 reload하면서 새 ClassLoader를 만들었는데 이전 loader를 thread, static registry, ThreadLocal 등이 계속 참조하면 그 loader가 정의한 많은 class와 관련 metadata까지 오래 남을 수 있습니다.

```text
old worker/thread
      │
      ▼
old ClassLoader
      │
      ├─ class metadata
      └─ static object graph
```

"class 하나가 memory leak"이라기보다 loader 전체의 생명주기가 끊기지 않는 문제입니다.

### GC 로그만 보고 leak을 확정하지 않는다

Heap 사용량이 증가하고 GC가 자주 발생한다고 해도 원인은 여러 가지입니다.

- 정상 workload 증가
- 순간적인 대량 allocation
- cache warm-up
- queue backlog
- live set 증가
- 실제 leak

Leak을 의심할 때는 여러 시점의 heap 사용과 object histogram/dump를 비교하고, 어떤 class의 instance/retained size가 계속 증가하는지 봅니다.

특히 full GC 이후에도 live set이 지속적으로 증가하는 패턴은 중요한 단서가 될 수 있지만 그 자체만으로 root cause를 확정하지 않습니다.

### heap dump에서는 shallow size보다 retained 관계가 중요할 때가 많다

작은 `HashMap` 객체 하나가 수백 MB를 직접 차지하지 않더라도 그 map이 큰 object graph를 붙잡고 있을 수 있습니다.

```text
Map object: 작음
  └─ entries
      └─ payloads: 매우 큼
```

그래서 단순 object 자체 크기(shallow size)뿐 아니라 **그 객체 때문에 함께 살아 있는 retained graph**를 봐야 합니다.

### 해결은 reference type보다 ownership 정책부터다

Leak을 발견했다고 바로 `WeakReference`로 바꾸는 것은 좋은 기본 해결책이 아닙니다.

먼저:

- 이 객체의 owner는 누구인가?
- 언제 수명이 끝나는가?
- 종료 시 누가 remove/unregister/close하는가?
- cache라면 최대 크기/TTL은 무엇인가?
- queue라면 capacity와 overload 정책은 무엇인가?

를 정합니다.

Weak reference는 "이 관계가 객체 수명을 연장해서는 안 된다"는 의미가 실제로 맞는 특수한 경우에 사용합니다.

### 문제를 풀 때 확인할 것

1. memory가 증가한다고 바로 GC 버그라고 생각하지 않습니다.
2. 증가하는 object 종류와 live set을 확인합니다.
3. GC root에서 큰 graph까지 retained path를 찾습니다.
4. static cache, listener, ThreadLocal, queue, ClassLoader를 확인합니다.
5. 애플리케이션이 생각하는 수명과 실제 reference 수명이 같은지 봅니다.
6. `System.gc()`나 WeakReference를 해결책으로 먼저 선택하지 않습니다.

### 면접에서 설명한다면

Java에서도 memory leak은 생길 수 있습니다. GC는 unreachable 객체만 회수하므로, 업무적으로 더 이상 필요하지 않은 객체가 static cache, listener, ThreadLocal 같은 장수 참조 때문에 reachable하게 남아 있으면 메모리가 계속 유지됩니다. 진단할 때는 heap에서 큰 객체만 찾기보다 GC root까지의 retained path를 따라가 "누가 왜 이 객체를 붙잡고 있는가"를 찾고, owner와 수명 정책을 수정해야 합니다.
