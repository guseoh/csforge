---
kind: concept
contentKey: java.core.concurrency.scoped-value-context
topicContentKey: java.core.concurrency
slug: scoped-value-context
title: "ScopedValue context"
summary: "Java 25의 ScopedValue가 값을 현재 thread의 제한된 dynamic scope에 바인딩하고 StructuredTaskScope 같은 명시적 구조에서 자식 작업으로 상속하는 방식을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 170
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html"
    title: "Java SE 25 API: ScopedValue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 25 ScopedValue의 per-thread binding·rebinding·inheritance 계약 확인
---
# ScopedValue는 어떤 context 전달 문제를 풀까

요청 ID나 인증 주체처럼 호출 계층 전체에서 읽어야 하는 값이 있습니다. 모든 메서드 인자로 전달하는 것이 가장 명시적이지만 깊은 호출 경로에서는 반복적인 plumbing이 커질 수 있습니다. 그렇다고 `ThreadLocal`에 값을 넣고 여기저기서 바꾸면 값의 생명주기와 정리 책임이 흐려질 수 있습니다.

Java 25의 `ScopedValue`는 **caller가 값을 현재 thread의 제한된 dynamic scope에 바인딩하고, 그 범위에서 직접 또는 간접 호출되는 코드가 읽는 방식**을 제공합니다. Java 25에서 `ScopedValue` 자체는 정식 API이고, one-way context transmission이 목적일 때 `ThreadLocal`보다 선호하도록 API 문서가 안내합니다.

### binding은 기본적으로 current thread에 속한다

```java
static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

ScopedValue.where(REQUEST_ID, "req-42").run(() -> {
    handleRequest();
});
```

`run()`은 **현재 thread**에서 `REQUEST_ID`가 `req-42`에 바인딩된 상태로 작업을 실행합니다. `handleRequest()`와 그 아래 호출도 같은 thread와 dynamic scope 안에서 binding을 읽을 수 있습니다.

```java
void handleRequest() {
    System.out.println(REQUEST_ID.get()); // req-42
    callService();
}
```

```text
current Thread
   │
   ├─ where(REQUEST_ID, "req-42")
   │      └─ run
   │          ├─ controller
   │          ├─ service
   │          └─ repository
   │
   └─ run 종료 -> 이전 binding으로 복원 또는 unbound
```

따라서 ScopedValue를 process-global 값이나 모든 thread가 자동 공유하는 static variable처럼 이해하면 안 됩니다.

### dynamic scope를 벗어나면 binding은 끝난다

ScopedValue의 중요한 성질은 `remove()`를 호출해 정리하는 mutable slot이 아니라 **실행 범위가 끝나면 binding이 자동으로 이전 상태로 돌아간다**는 점입니다.

Binding이 없는 곳에서 `get()`하면 값을 임의로 `null`로 돌려주는 것이 아니라 unbound 상태에 대한 예외가 발생할 수 있으므로, optional access가 필요하면 `isBound()`나 API가 제공하는 대체 조회 방식을 사용합니다.

### ThreadLocal과 가장 큰 차이는 one-way transmission과 lifetime이다

`ThreadLocal`은 현재 thread의 copy를 `set()`으로 변경하고 `remove()`로 지울 수 있습니다.

```text
ThreadLocal
set -> read -> set again -> remove
```

ScopedValue는 caller가 bounded scope를 만들고 callee는 보통 그 binding을 읽습니다.

```text
ScopedValue
outer caller binds
       │
       ▼
callee reads
       │
       ▼
scope ends -> previous binding restored
```

API 문서가 `ScopedValue`를 ThreadLocal보다 선호하도록 권하는 범위도 바로 이런 **method parameter 없이 값을 한 방향으로 전달하는 경우**입니다. 모든 thread-local state의 범용 대체품이라는 뜻은 아닙니다.

### 중첩 범위의 rebinding은 mutable overwrite와 다르다

같은 key에 더 안쪽 scope에서 새 값을 바인딩할 수 있습니다.

```java
ScopedValue.where(REQUEST_ID, "outer").run(() -> {
    System.out.println(REQUEST_ID.get()); // outer

    ScopedValue.where(REQUEST_ID, "inner").run(() -> {
        System.out.println(REQUEST_ID.get()); // inner
    });

    System.out.println(REQUEST_ID.get()); // outer
});
```

`inner`가 끝나면 기존 `outer` binding이 다시 보입니다. 전역 slot의 값을 바꾼 뒤 수동으로 복구하는 것이 아니라 **nested dynamic scope가 더 안쪽 binding을 일시적으로 가리는 구조**입니다.

### 다른 thread로 자동 복사되는 API는 아니다

ScopedValue binding은 per-thread라는 점이 핵심입니다.

```java
ScopedValue.where(REQUEST_ID, "req-42").run(() -> {
    arbitraryExecutor.submit(() -> {
        // req-42가 자동으로 보인다고 일반화하면 안 됨
    });
});
```

새로운 thread나 arbitrary executor에 task를 넘겼다고 current binding이 자동 전파된다는 일반 계약은 없습니다. Thread 경계를 넘는 inheritance는 **사용하는 concurrency API가 명시적으로 제공할 때만** 기대해야 합니다.

### StructuredTaskScope에서는 binding inheritance가 명시적으로 제공된다

Java 25 `ScopedValue`와 `StructuredTaskScope` 문서는 scope를 연 thread에 bound된 ScopedValue가 그 scope에서 fork된 subtask thread에 상속된다고 명시합니다.

```java
ScopedValue.where(REQUEST_ID, "req-42").run(() -> {
    try (var scope = StructuredTaskScope.open()) {
        scope.fork(() -> childTask());
        scope.join();
    }
});
```

개념적으로:

```text
parent thread: REQUEST_ID = req-42
       │
       └─ StructuredTaskScope
             ├─ subtask A -> binding inherited
             └─ subtask B -> binding inherited
```

이것은 "ScopedValue는 모든 비동기 작업에 자동 전파된다"는 규칙이 아니라 **StructuredTaskScope가 정의한 inheritance 계약**입니다. 또한 Java 25의 `StructuredTaskScope`는 preview API이므로, ScopedValue 자체의 표준 API 상태와 혼동하지 않습니다.

### binding이 읽기 중심이라고 value object까지 immutable해지는 것은 아니다

```java
record RequestContext(List<String> permissions) {}
```

이 객체를 ScopedValue에 바인딩했다고 내부 `List`가 자동으로 복사되거나 불변이 되는 것은 아닙니다. StructuredTaskScope로 여러 child가 같은 object reference를 보게 되고 그 object가 mutable하다면 shared mutable state 문제는 별도로 존재합니다.

ScopedValue가 보호하는 것은 **binding의 lifetime과 접근 모델**이지 value object를 deep-freeze하는 것이 아닙니다.

### 많은 작은 ScopedValue를 무분별하게 만드는 것도 구현 비용이 있다

Java 25 API는 ScopedValue를 비교적 작은 개수로 사용할 것을 권합니다. Reference implementation은 per-thread cache를 사용하므로 아주 많은 scoped value를 순환적으로 조회하면 cache 효율이 나빠질 수 있습니다.

여러 context 값이 항상 함께 이동한다면:

```java
record RequestContext(
        String requestId,
        String tenantId,
        Principal principal
) {}
```

처럼 하나의 context object로 묶어 단일 ScopedValue에 바인딩하는 방법을 검토할 수 있습니다. 이 부분은 Java API의 구현 note이므로 language-level correctness 규칙과는 구분합니다.

### 문제를 풀 때 확인할 것

1. binding을 만든 thread가 누구인지 봅니다.
2. binding의 dynamic scope가 어디서 시작하고 끝나는지 그립니다.
3. callee가 값을 읽기만 하는 one-way context인지 확인합니다.
4. nested rebinding과 mutable overwrite를 구분합니다.
5. 다른 executor/thread로 넘어가면 inheritance가 명시된 API인지 확인합니다.
6. StructuredTaskScope의 subtask inheritance와 arbitrary executor를 구분합니다.
7. 바인딩된 object 자체가 mutable하면 별도의 ownership/synchronization을 확인합니다.
8. ScopedValue와 StructuredTaskScope의 Java 25 API 상태를 혼동하지 않습니다.

### 자주 헷갈리는 부분

- ScopedValue binding은 기본적으로 per-thread입니다.
- `where(...).run/call`의 bounded dynamic scope가 끝나면 binding도 이전 상태로 돌아갑니다.
- arbitrary executor로 task를 넘긴다고 binding이 자동 복사되지는 않습니다.
- StructuredTaskScope에서는 subtask inheritance가 API 계약으로 제공됩니다.
- binding이 읽기 중심이라고 value object 자체가 immutable해지는 것은 아닙니다.
- Java 25의 ScopedValue는 정식 API지만 StructuredTaskScope는 preview API입니다.

### 면접에서 설명한다면

`ScopedValue`는 caller가 값을 현재 thread의 bounded dynamic scope에 바인딩하고 안쪽 호출이 읽도록 하는 Java 25 API입니다. `ThreadLocal`처럼 callee가 thread-local slot을 임의로 변경하고 수동으로 remove하는 모델보다 one-way request context 전달에 적합합니다. Binding은 기본적으로 per-thread이고 arbitrary executor로 자동 전파되지 않지만, `StructuredTaskScope`처럼 명시적으로 지원하는 구조에서는 fork된 subtask thread가 binding을 상속합니다. 바인딩된 객체 자체의 mutability나 thread-safety는 별도 문제입니다.
