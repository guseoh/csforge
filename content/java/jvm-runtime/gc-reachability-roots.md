---
kind: concept
contentKey: java.core.jvm-runtime.gc-reachability-roots
topicContentKey: java.core.jvm-runtime
slug: gc-reachability-roots
title: "GC reachability and roots"
summary: "객체가 source scope를 벗어나는 것과 GC 회수 가능 상태를 구분하고 살아 있는 root에서 객체까지의 reachability로 수명을 판단한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html#jvms-2.5.3"
    title: "Java SE 25 JVMS: Heap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: heap과 automatic storage reclamation 범위 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ref/package-summary.html"
    title: "Java SE 25 API: java.lang.ref"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: reachability와 reference processing 개념 확인
---
# 객체는 언제 GC가 회수할 수 있게 될까

Java에서는 `free()`를 직접 호출하지 않습니다. 그래서 "변수가 scope를 벗어나면 객체가 삭제된다"고 단순하게 이해하기 쉽지만, 실제로 중요한 기준은 **그 객체에 아직 도달할 수 있는 참조 경로가 있는가**입니다.

GC는 살아 있는 출발점에서 객체 graph를 따라가며 어떤 객체가 여전히 reachable한지 판단합니다.

### 변수의 scope와 객체의 수명은 같은 것이 아니다

```java
User createUser() {
    User user = new User("kim");
    return user;
}
```

`createUser()`가 끝나면 local variable `user`는 해당 method frame과 함께 더 이상 사용할 수 없지만, 반환된 참조를 caller가 들고 있다면 `User` 객체는 계속 사용할 수 있습니다.

```text
createUser local 종료
         │
         └─ caller reference ──▶ User object
```

반대로 source상 변수가 아직 lexical scope 안에 있다고 해서 JVM이 반드시 method 끝까지 그 reference를 GC root에서 live하게 유지해야 한다고 단순화할 수도 없습니다. JIT는 더 이상 사용되지 않는 값의 liveness를 분석할 수 있습니다.

그래서 source scope와 runtime reachability를 분리해서 생각합니다.

### GC root는 reachability 탐색의 시작점이다

개념적으로 GC는 몇 가지 살아 있는 runtime root에서 참조를 따라갑니다.

```text
GC Roots
  ├─ 실행 중 thread의 live references
  ├─ class/static 쪽에서 유지되는 references
  ├─ JVM/native runtime이 유지하는 일부 references
  └─ ... implementation-defined runtime roots
          │
          ▼
       object graph
```

정확한 root 종류와 collector 내부 표현은 JVM implementation의 영역입니다. 학습할 때는 **"애플리케이션이 아직 접근할 수 있는 살아 있는 경로의 출발점"**이라고 잡으면 충분합니다.

### root에서 따라갈 수 있으면 객체는 reachable하다

```text
Root
 │
 ▼
Cache
 │
 ├─▶ User A
 │      └─▶ Address A
 │
 └─▶ User B
```

`Address A`를 직접 가리키는 static field가 없어도 Root → Cache → User A → Address A라는 경로가 있기 때문에 reachable합니다.

반대로:

```text
Root ──▶ User A

         User C ──▶ Address C
```

`User C`로 이어지는 root 경로가 사라졌다면 `User C`와 `Address C`는 함께 회수 후보가 될 수 있습니다. 객체끼리 서로를 가리키는 cycle이 있더라도 root에서 도달할 수 없다면 reference counting처럼 단순히 "서로 참조하니 영원히 산다"고 볼 필요는 없습니다.

### unreachable은 "즉시 삭제됨"이 아니다

객체가 더 이상 reachable하지 않다는 것은 collector가 그 storage를 회수할 수 있는 상태가 되었다는 의미입니다.

```text
마지막 strong path 제거
        │
        ▼
unreachable
        │
        │ 다음 GC cycle/collector 정책
        ▼
reclaim 가능/수행
```

정확히 언제 메모리가 재사용되는지 애플리케이션이 임의로 지정할 수는 없습니다.

그래서 다음 코드는 잘못된 기대를 만들 수 있습니다.

```java
object = null;
System.gc();
// 여기에서 객체가 반드시 즉시 물리적으로 사라졌다고 보장할 수 없음
```

`System.gc()`도 GC 수행을 요청하는 성격이지 특정 객체를 지금 즉시 회수하라는 강제 명령으로 이해하면 안 됩니다.

### `null` 대입은 언제 의미가 있을까

짧은 method의 local variable마다 습관적으로 `x = null`을 넣는 것은 보통 필요하지 않습니다. method가 곧 끝나면 reference도 자연스럽게 수명에서 벗어납니다.

하지만 아주 긴 method나 장수 collection에서 더 이상 필요 없는 큰 객체 참조를 계속 보유하는 경우에는 **참조 경로를 끊는 것** 자체가 의미가 있습니다.

```java
largeBuffer = null; // 정말 이후 사용하지 않고 method가 매우 길게 계속된다면 의미가 있을 수 있음
```

더 중요한 실무 문제는 local variable보다 cache, listener, ThreadLocal, static collection처럼 장수 owner가 불필요한 객체를 계속 가리키는 경우입니다.

### object graph를 그리면 memory leak도 이해하기 쉬워진다

```text
static cache (root 경로)
    │
    └─ key -> Session
              └─ huge payload
```

사용자는 session이 이미 만료됐다고 생각해도 cache에서 entry를 삭제하지 않았다면 GC 관점에서는 여전히 정상적으로 reachable합니다. GC가 고장 난 것이 아닙니다.

이렇게 "필요 없음"과 "unreachable"은 같은 말이 아닙니다.

- 업무적으로 필요 없음: 애플리케이션 정책의 판단
- GC 관점에서 unreachable: root에서 참조 경로가 없음

Memory leak은 이 둘이 어긋나는 대표적인 상황입니다.

### reference strength에 따라 reachability 분류가 더 세분화된다

일반적인 strong reference 외에 `SoftReference`, `WeakReference`, `PhantomReference` 같은 reference object를 사용하면 GC의 reachability 분류가 더 세밀해집니다.

하지만 먼저 strong reachability와 root graph를 이해하는 것이 우선입니다. reference strength를 "GC에게 몇 초 뒤 삭제하라고 말하는 API"처럼 생각하면 안 됩니다.

### 문제를 풀 때 확인할 것

1. source variable의 scope와 객체의 runtime reachability를 구분합니다.
2. 살아 있는 root에서 객체까지 어떤 path가 남아 있는지 그립니다.
3. 객체끼리 cycle이 있어도 root path가 있는지 먼저 봅니다.
4. unreachable과 즉시 reclaim을 같은 사건으로 보지 않습니다.
5. `System.gc()`가 특정 객체의 즉시 회수를 보장한다고 가정하지 않습니다.
6. memory leak에서는 "왜 아직 reachable한가"를 찾습니다.

### 면접에서 설명한다면

Java GC에서 객체 수명은 단순히 local variable의 scope가 끝났는지보다 GC root에서 해당 객체까지 도달 가능한지로 이해해야 합니다. Root에서 strong reference 경로가 남아 있으면 객체는 계속 reachable하고, 그 경로가 사라지면 GC가 회수할 수 있는 후보가 됩니다. Unreachable이 됐다고 즉시 메모리가 해제되는 것은 아니며, GC가 있어도 불필요한 객체가 cache나 static reference 때문에 계속 reachable하면 memory leak이 생길 수 있습니다.