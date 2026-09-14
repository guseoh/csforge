---
kind: concept
contentKey: java.core.concurrency.scoped-value-context
topicContentKey: java.core.concurrency
slug: scoped-value-context
title: "ScopedValue로 실행 문맥 전달하기"
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
# ScopedValue로 실행 문맥 전달하기

요청 ID나 인증 주체처럼 깊은 호출 경로에서 읽어야 하지만 모든 중간 메서드가 매개변수로 전달할 필요는 없는 값이 있습니다. Java 25의 `ScopedValue`는 이런 값을 **현재 thread의 제한된 dynamic scope에 바인딩하고 안쪽 호출에서 읽게 하는 API**입니다.

`ScopedValue` 자체는 Java 25의 정식 API이며, 공식 문서는 목적이 "메서드 매개변수 없이 one-way로 값을 전달하는 것"이라면 `ThreadLocal`보다 우선 검토하도록 안내합니다.

### binding은 bounded dynamic scope를 가진다

```java
static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

ScopedValue.where(REQUEST_ID, "req-42").run(() -> {
    handleRequest();
});
```

`handleRequest()`와 그 아래에서 같은 thread로 직접 이어지는 호출은 `REQUEST_ID.get()`으로 현재 binding을 읽을 수 있습니다.

```text
current thread
    │
    ├─ bind REQUEST_ID=req-42
    │      │
    │      └─ run
    │          ├─ controller
    │          ├─ service
    │          └─ repository
    │
    └─ scope 종료 -> 이전 binding 복원 또는 unbound
```

ThreadLocal처럼 `remove()`를 직접 호출해 정리하는 mutable slot이 아니라, 실행 범위가 끝날 때 binding lifetime도 함께 닫힌다는 점이 핵심입니다.

### 안쪽 scope에서 rebinding할 수 있다

```java
ScopedValue.where(REQUEST_ID, "outer").run(() -> {
    System.out.println(REQUEST_ID.get()); // outer

    ScopedValue.where(REQUEST_ID, "inner").run(() -> {
        System.out.println(REQUEST_ID.get()); // inner
    });

    System.out.println(REQUEST_ID.get()); // outer
});
```

안쪽 binding이 바깥 값을 영구적으로 overwrite하는 것이 아닙니다. Nested dynamic scope 동안 더 안쪽 binding이 보이고, scope가 끝나면 이전 binding으로 돌아갑니다.

### 기본적으로 모든 새 thread에 자동 전파되는 것은 아니다

```java
ScopedValue.where(REQUEST_ID, "req-42").run(() -> {
    executor.submit(() -> {
        // arbitrary executor에서 req-42가 자동으로 보인다고 가정할 수 없음
    });
});
```

ScopedValue의 thread 간 공유는 **구조화된 방식으로 명시적으로 지원되는 경우**에 한정됩니다. 새 thread나 arbitrary executor로 task를 넘겼다고 현재 binding이 자동 복사되는 일반 규칙은 없습니다.

### StructuredTaskScope에서는 binding inheritance가 계약으로 제공된다

Java 25의 `StructuredTaskScope`는 preview API지만, ScopedValue binding 상속을 명시적으로 지원합니다. Scope를 열 때 owner thread의 binding을 capture하고 그 scope에서 `fork`한 subtask thread에 상속합니다.

```java
ScopedValue.where(REQUEST_ID, "req-42").run(() -> {
    try (var scope = StructuredTaskScope.open()) {
        scope.fork(() -> childTask());
        scope.join();
    }
});
```

```text
owner thread: REQUEST_ID=req-42
       │
       └─ StructuredTaskScope
             ├─ subtask A -> binding inherited
             └─ subtask B -> binding inherited
```

이것은 "ScopedValue는 비동기 작업에 자동 전파된다"는 뜻이 아니라 **StructuredTaskScope가 제공하는 inheritance 계약**입니다. Java 25에서 `ScopedValue`는 정식 API이고 `StructuredTaskScope`는 preview라는 API 상태도 구분해야 합니다.

### binding이 읽기 중심이어도 value object 자체는 mutable할 수 있다

```java
record RequestContext(List<String> permissions) { }
```

이 객체를 ScopedValue에 바인딩했다고 `permissions`가 deep immutable해지는 것은 아닙니다. 여러 structured subtask가 같은 mutable object를 공유한다면 그 객체에 대한 synchronization이나 ownership 규칙이 별도로 필요합니다.

ScopedValue가 제공하는 것은 **binding의 방향과 lifetime을 구조화하는 것**이지 값 객체를 자동으로 thread-safe하게 만드는 기능이 아닙니다.

### ThreadLocal과 비교할 때 목적을 먼저 본다

```text
ThreadLocal
- thread에 mutable slot을 둠
- set/remove 가능
- lifetime을 thread와 함께 관리

ScopedValue
- caller가 bounded scope에서 값을 bind
- callee는 주로 읽음
- scope 종료와 함께 binding 복원
```

따라서 request context처럼 바깥에서 정하고 안쪽에서는 읽기만 하는 값에 ScopedValue가 잘 맞습니다. 반대로 같은 thread 안에서 계속 갱신해야 하는 상태라면 ThreadLocal이나 더 명시적인 객체 전달이 맞을 수 있습니다.

ScopedValue 코드를 읽을 때는 **binding이 시작·종료되는 dynamic scope, 실행 thread가 바뀌는 경계, thread 간 inheritance를 제공하는 API가 실제로 있는지, 바인딩한 object 자체가 mutable한지**를 차례로 확인하세요. 핵심은 전역 context 저장소가 아니라 bounded one-way context transmission입니다.
