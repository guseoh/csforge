---
kind: concept
contentKey: java.core.concurrency.scoped-value-context
topicContentKey: java.core.concurrency
slug: scoped-value-context
title: "ScopedValue context"
summary: "Java 25의 ScopedValue가 값을 제한된 실행 범위에 바인딩해 안쪽 호출로 전달하는 방식과 ThreadLocal과의 차이를 이해한다"
level: 3
status: PUBLISHED
displayOrder: 170
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html"
    title: "Java SE 25 API: ScopedValue"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 25 ScopedValue의 binding·run/call·범위 계약 확인
---
# ScopedValue는 어떤 context 전달 문제를 풀까

요청 ID나 인증 주체처럼 호출 계층 전체에서 읽어야 하는 값이 있습니다. 모든 메서드 인자로 전달하는 것이 가장 명시적이지만, 아주 깊은 호출 경로에서는 반복적인 plumbing이 커질 수 있습니다. 그렇다고 `ThreadLocal`에 값을 넣고 여기저기서 바꾸면 값의 생명주기와 정리 책임이 흐려질 수 있습니다.

Java 25의 `ScopedValue`는 **바깥 호출이 값을 일정 실행 범위에 바인딩하고, 그 범위 안쪽의 코드가 읽는 방식**을 제공합니다.

### 값은 "thread에 오래 저장"하기보다 "범위 동안 연결"된다

```java
static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

ScopedValue.where(REQUEST_ID, "req-42").run(() -> {
    handleRequest();
});
```

`handleRequest()`와 그 아래 호출에서 같은 binding을 읽을 수 있습니다.

```java
void handleRequest() {
    System.out.println(REQUEST_ID.get()); // req-42
    callService();
}
```

하지만 `run`의 실행 범위를 벗어나면 그 binding은 더 이상 현재 binding이 아닙니다.

```text
밖
 │
 ├─ where(REQUEST_ID, "req-42")
 │      │
 │      ├─ controller
 │      │    └─ service
 │      │          └─ repository
 │      │
 │      └─ scope 종료
 │
밖 -> 해당 binding 없음
```

이 **범위가 코드 구조에 드러난다**는 점이 중요합니다.

### ThreadLocal과 가장 큰 차이는 변경 모델이다

`ThreadLocal`은 현재 thread에서 값을 `set()`하고 나중에 `remove()`하는 mutable한 저장소처럼 사용할 수 있습니다.

```java
CURRENT.set(context);
try {
    work();
} finally {
    CURRENT.remove();
}
```

ScopedValue는 caller가 binding 범위를 만들고 callee는 보통 그 값을 읽습니다. callee가 같은 binding을 임의로 덮어쓰는 전역 mutable slot처럼 사용하는 모델이 아닙니다.

```text
ThreadLocal
set -> read -> set again -> remove

ScopedValue
bind at outer scope
        ↓
      read
        ↓
     scope end
```

그래서 request ID, tenant ID, tracing context처럼 **바깥에서 정해지고 안쪽 호출이 읽는 값**과 잘 맞습니다.

### 중첩 범위에서는 더 안쪽 binding을 사용할 수 있다

같은 ScopedValue key에 더 안쪽 범위에서 다른 값을 바인딩할 수 있습니다. 중요한 점은 기존 값을 mutable하게 덮어쓴 뒤 복구하는 것이 아니라 **새로운 중첩 scope**를 만드는 방식으로 이해하는 것입니다.

```java
ScopedValue.where(REQUEST_ID, "outer").run(() -> {
    System.out.println(REQUEST_ID.get()); // outer

    ScopedValue.where(REQUEST_ID, "inner").run(() -> {
        System.out.println(REQUEST_ID.get()); // inner
    });

    System.out.println(REQUEST_ID.get()); // outer
});
```

이 구조는 값의 유효 범위를 호출 구조와 맞추기 쉽습니다.

### binding이 읽기 중심이라고 객체까지 immutable해지는 것은 아니다

```java
record RequestContext(List<String> permissions) {}
```

이 객체를 ScopedValue에 바인딩했다고 내부 `List`가 자동으로 복사되거나 불변이 되는 것은 아닙니다. 여러 thread가 같은 mutable 객체를 함께 본다면 그 객체의 ownership과 synchronization 문제는 그대로 남습니다.

ScopedValue가 제공하는 것은 **binding의 범위와 접근 방식**이지 객체 전체를 deep-freeze하는 기능이 아닙니다.

### context와 thread의 관계를 단순화해서 말하면 안 된다

ScopedValue는 특히 virtual thread와 구조화된 작업 모델에서 context 전달을 더 잘 표현하기 위해 발전해 왔지만, "ScopedValue를 쓰면 아무 비동기 작업에나 자동으로 전파된다"고 일반화하면 안 됩니다.

어떤 자식 작업이 binding을 상속하거나 접근할 수 있는지는 사용하는 API와 실행 구조의 계약을 확인해야 합니다. 별도 executor에 임의로 task를 던졌을 때 모든 context가 자동 복제된다고 생각하지 않습니다.

### 왜 서버 코드에서 관심을 가질 만한가

ThreadLocal을 사용한 request context는 오랫동안 널리 쓰였습니다. 하지만 thread pool 재사용, `remove()` 누락, async 전파 같은 문제를 항상 관리해야 합니다.

ScopedValue는 다음 조건에서 더 자연스러울 수 있습니다.

- 값이 요청 시작 시 정해진다.
- 아래 호출들은 값을 읽기만 하면 된다.
- 값의 유효 범위가 호출 scope와 일치한다.
- scope를 벗어나면 값이 남아 있을 이유가 없다.

반대로 한 thread에서 값을 계속 변경하고 독립적인 생명주기로 유지해야 하는 상태라면 ThreadLocal과 요구가 다릅니다.

### 문제를 풀 때 확인할 것

1. 값은 누가 결정하고 누가 읽는지 구분합니다.
2. 값이 중간에서 변경되어야 하는지, 읽기 중심인지 봅니다.
3. binding이 어느 코드 범위까지 유효한지 그립니다.
4. 범위를 벗어난 뒤 값을 읽으려 하는지 확인합니다.
5. 바인딩된 객체 자체가 mutable한지 별도로 봅니다.
6. async/executor 경계의 전파를 추측하지 말고 사용 API 계약을 확인합니다.

### 면접에서 설명한다면

`ScopedValue`는 값을 특정 실행 범위에 바인딩하고 그 범위 안쪽 호출이 읽을 수 있게 하는 Java API입니다. ThreadLocal처럼 thread에 값을 설정하고 직접 정리하는 mutable 저장 방식보다, 바깥에서 정해진 request context를 제한된 호출 범위에 전달하는 상황에 잘 맞습니다. 다만 바인딩된 객체 자체를 불변으로 만들거나 모든 비동기 경계에 자동 전파하는 기능은 아니므로 값의 수명과 실행 구조를 함께 봐야 합니다.