---
kind: concept
contentKey: java.core.concurrency.threadlocal-context
topicContentKey: java.core.concurrency
slug: threadlocal-context
title: "ThreadLocal과 실행 문맥"
summary: "ThreadLocal이 스레드별로 값을 보관하는 방식과 스레드 풀 재사용·`remove()`·가상 스레드·비동기 경계에서 생기는 문제를 이해한다"
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

요청 ID처럼 같은 실행 흐름의 여러 계층에서 읽어야 하지만 모든 메서드 매개변수로 반복해서 전달하고 싶지 않은 값이 있습니다. `ThreadLocal`은 **같은 ThreadLocal 키를 사용해도 각 Java 스레드가 자기 값을 갖게 하는 저장 공간**입니다.

```java
private static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();
```

```text
같은 `ThreadLocal` 객체
      │
      ├─ 스레드 A -> "req-A"
      └─ 스레드 B -> "req-B"
```

ThreadLocal 객체가 스레드마다 복제되는 것이 아니라, `get()`과 `set()`이 현재 스레드에 연결된 값을 다룹니다.

### 값의 수명은 스레드 수명과 연결된다

```java
REQUEST_ID.set("req-1");
try {
    handleRequest();
} finally {
    REQUEST_ID.remove();
}
```

ThreadLocal 값을 현재 작업보다 오래 남겨서는 안 되는 경우 `remove()`로 수명을 명시적으로 닫는 것이 중요합니다.

특히 플랫폼 스레드 풀에서는 한 작업자가 여러 요청을 순서대로 처리할 수 있습니다.

```text
worker-1
  ├─ Request A -> REQUEST_ID = A
  └─ Request B -> 같은 worker 재사용
```

A가 끝날 때 값을 제거하지 않으면 B가 stale 문맥을 읽거나, A에서 보관한 큰 객체가 long-lived 작업자와 함께 오래 유지될 수 있습니다.

`set(null)`과 `remove()`도 같은 API가 아닙니다. `remove()`는 현재 스레드의 entry를 제거하고, 이후 `get()` 시 `initialValue()`가 다시 적용될 수 있습니다.

### Thread가 바뀌면 일반 ThreadLocal 값도 자동으로 따라가지 않는다

```java
REQUEST_ID.set("req-1");

executor.submit(() -> {
    // 다른 worker에서는 같은 값을 자동으로 본다고 가정할 수 없음
});
```

ThreadLocal은 "논리적인 요청"에 값을 붙이는 기능이 아니라 **현재 Java 스레드에 값을 연결하는 기능**입니다. `CompletableFuture`나 별도 executor로 실행 스레드가 바뀌면 일반 ThreadLocal 값이 자동 전파된다고 기대할 수 없습니다.

`InheritableThreadLocal`은 스레드 생성 시 별도 inheritance 규칙을 가지지만 arbitrary async 작업의 범용 문맥 propagation 계약은 아닙니다.

### ThreadLocal 안의 값이 공유 객체라면 그 객체의 경합은 그대로다

```java
List<String> shared = new ArrayList<>();

localA.set(shared);
localB.set(shared);
```

두 스레드가 서로 다른 ThreadLocal slot을 사용해도 값이 같은 가변 객체 참조라면 그 객체 자체는 여전히 공유됩니다. ThreadLocal은 값을 복사하거나 불변하게 만들지 않습니다.

```text
스레드 A의 로컬 값 ──┐
                 ├──> 같은 변경 가능한 List
스레드 B의 로컬 값 ──┘
```

### Virtual 스레드에서는 고정 작업 스레드 leakage와 자원 비용을 나눠 본다

Task마다 새 가상 스레드를 만드는 구조에서는 long-lived 고정 작업 스레드가 다음 요청에 stale ThreadLocal 값을 넘기는 문제의 형태가 달라집니다. Task가 끝나면 가상 스레드 자체도 끝나기 때문입니다.

하지만 가상 스레드를 매우 많이 만들 수 있으므로 각 스레드마다 크고 비싼 reusable 객체를 ThreadLocal 캐시로 두면 전체 메모리 사용량이 커질 수 있습니다.

```text
platform pool 시대
small worker count × per-thread cache

virtual thread-per-task
very many threads × per-thread cache
```

따라서 가상 스레드 환경에서는 ThreadLocal이 "지원되는가"와 "이 값을 스레드마다 하나씩 두는 것이 좋은 자원 모델인가"를 구분해야 합니다.

### One-way 문맥이라면 ScopedValue와 목적을 비교한다

`ThreadLocal`은 같은 스레드 안에서 값을 `set`하고 변경하거나 `remove`할 수 있는 변경 가능 스레드별 저장소입니다. Java 25의 `ScopedValue`는 호출자가 제한된 동적 범위(dynamic scope) 동안 값을 바인딩하고 호출 대상이 읽는 **단방향 문맥 전달(one-way context transmission)**에 맞게 설계되었습니다.

```text
ThreadLocal
스레드에 묶인 가변 슬롯
set -> get -> set/remove

ScopedValue
바깥 호출자가 바인딩
      -> inner call chain reads
      -> scope 종료 시 이전 binding 복원
```

모든 ThreadLocal을 ScopedValue로 바꿔야 한다는 뜻은 아닙니다. 목적이 스레드-specific 가변 상태인지, bounded one-way 문맥인지에 따라 선택합니다.

ThreadLocal 문제를 볼 때는 **누가 집합하는가, 같은 스레드가 얼마나 오래 사는가, 작업 종료 시 remove되는가, async 경계에서 스레드가 바뀌는가, 저장된 객체 자체가 공유 가변 상태인가**를 순서대로 확인하세요. ThreadLocal의 핵심 위험은 API 자체보다 값의 수명과 실제 스레드 경계를 잘못 가정할 때 드러납니다.
