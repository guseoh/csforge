---
kind: concept
contentKey: java.core.design-patterns.proxy-pattern
topicContentKey: java.core.design-patterns
slug: proxy-pattern
title: "Proxy와 호출 중개"
summary: "실제 객체 앞의 대리 객체가 접근 조건·지연 생성·캐시·원격 호출을 어떻게 중개하는지, 호출 경로와 검사 순서가 Proxy 의미를 어떻게 결정하는지 이해한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Proxy.html"
    title: "Java SE 25 API: Proxy"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JDK dynamic Proxy API 확인
---
# Proxy와 호출 중개

Proxy는 호출자가 실제 객체를 직접 사용하지 않고 **같은 역할을 제공하는 대리 객체를 먼저 거치게 하는 구조**입니다.

```text
Client
  │ same contract
  ▼
Proxy
  │ access / lazy init / cache / remote forwarding
  ▼
Real Subject
```

예를 들어 repository 호출 시간을 측정하는 대리 객체를 만들 수 있습니다.

```java
interface OrderRepository {
    Order find(long id);
}

final class MeasuringRepositoryProxy implements OrderRepository {
    private final OrderRepository target;

    MeasuringRepositoryProxy(OrderRepository target) {
        this.target = target;
    }

    @Override
    public Order find(long id) {
        long start = System.nanoTime();
        try {
            return target.find(id);
        } finally {
            System.out.println(System.nanoTime() - start);
        }
    }
}
```

호출자는 `OrderRepository`만 사용하지만 실제 호출은 Proxy를 거쳐 target으로 전달됩니다.

### 핵심은 target의 business behavior보다 “target에 접근하는 과정”을 소유하는 것이다

Proxy가 자주 맡는 책임은 다음과 같습니다.

```text
Protection Proxy : 권한·접근 조건 확인
Virtual Proxy    : 비싼 실제 객체 생성을 필요할 때까지 지연
Caching Proxy    : 호출 결과 재사용 여부 결정
Remote Proxy     : 원격 호출을 로컬 역할처럼 중개
```

공통점은 실제 대상이 제공하는 핵심 기능을 새로 정의하기보다 **그 기능에 도달하는 시점과 조건을 관리**한다는 것입니다.

### 검사와 target 생성의 순서는 계약을 바꾼다

권한이 있는 호출에서만 비싼 target을 생성하고 이후 재사용하는 Proxy를 생각해 봅시다.

```java
Result read(User user) {
    if (target == null) {
        target = createExpensiveTarget();
    }
    checkPermission(user);
    return target.read();
}
```

새 Proxy에 권한 없는 사용자가 한 번 호출하면 target은 이미 생성된 뒤 `checkPermission`에서 실패합니다. Java exception이 앞선 객체 생성을 되돌리지는 않습니다.

요구가 “권한 없는 호출은 target 생성조차 유발하지 않는다”라면 순서를 바꿔야 합니다.

```java
Result read(User user) {
    checkPermission(user);
    if (target == null) {
        target = createExpensiveTarget();
    }
    return target.read();
}
```

```text
거부된 호출
Client -> permission check -> reject
                         target 생성 0회

첫 허가 호출
Client -> permission check -> create target -> read

다음 허가 호출
Client -> permission check -> reuse target -> read
```

Proxy에서는 “권한 검사도 하고 lazy loading도 한다”는 기능 목록보다 **어느 책임이 먼저 실행되는가**가 실제 의미를 결정합니다.

### Proxy를 우회하는 직접 경로가 있으면 접근 제어가 무력화될 수 있다

Protection Proxy가 권한 검사를 하더라도 호출자가 실제 target reference를 직접 얻을 수 있다면 다음처럼 우회할 수 있습니다.

```text
정상 경로: Client -> SecurityProxy -> Target
우회 경로: Client -----------------> Target
```

따라서 보안 목적 Proxy는 wrapper class 하나를 만드는 것으로 끝나지 않습니다. **민감한 대상에 도달하는 모든 공개 경로가 같은 정책을 통과하는가**를 봐야 합니다.

이 점은 접근 제어가 application 전체 보안의 한 요소일 뿐이라는 사실과도 연결됩니다.

### lazy Proxy는 생성 전 상태와 생성 후 상태를 가진다

Virtual Proxy는 사실상 내부적으로 작은 state machine을 갖습니다.

```text
UNINITIALIZED
    │ first allowed access
    ▼
INITIALIZED(target)
    │ subsequent access
    └─────────────── reuse
```

thread 여러 개가 동시에 첫 접근을 할 수 있다면 다음 코드에서 target이 두 번 생성될 수도 있습니다.

```java
if (target == null) {
    target = createTarget();
}
```

실제로 한 instance만 만들어야 하는 요구라면 synchronization이나 안전한 initialization 전략을 별도로 설계해야 합니다. Proxy 패턴 자체는 thread-safe lazy initialization을 자동으로 보장하지 않습니다.

반대로 target 두 개가 잠깐 생성되어도 의미상 문제가 없고 비용만 약간 늘어나는 상황이라면 복잡한 동기화를 넣지 않는 선택도 가능합니다. **identity와 생성 비용 요구를 먼저 확인**해야 합니다.

### cache Proxy는 결과의 유효 기간과 key 의미를 함께 가져간다

```java
Map<Long, Order> cache;
```

단순히 `id -> Order`를 저장하면 빠를 수 있지만 원본이 변경된 뒤 언제 cache를 무효화할지, mutable `Order` reference를 여러 호출자가 공유해도 되는지 결정해야 합니다.

Proxy가 캐시 책임을 추가하는 순간 다음 질문이 생깁니다.

```text
cache key는 무엇인가
언제 stale이 되는가
failure도 cache하는가
mutable 결과를 그대로 공유하는가
```

그래서 Caching Proxy는 “Map 한 번 조회한다”가 아니라 **대상 접근 결과의 수명 정책을 중개**하는 구조입니다.

### JDK dynamic Proxy는 Proxy 패턴을 구현하는 한 방법이다

`java.lang.reflect.Proxy`는 runtime에 interface 기반 proxy class를 만들고 method 호출을 `InvocationHandler`에 전달할 수 있습니다.

```java
InvocationHandler handler = (proxy, method, args) -> {
    System.out.println(method.getName());
    return method.invoke(target, args);
};
```

하지만 Proxy 패턴 자체가 reflection API를 뜻하는 것은 아닙니다. 앞의 `MeasuringRepositoryProxy`처럼 직접 class를 작성해도 같은 구조입니다.

JDK dynamic Proxy는 interface 기반이라는 제약과 reflection invocation 비용·예외 처리 규칙을 갖습니다. 이런 구현 세부는 별도 Concept에서 더 깊게 다룰 수 있지만 여기서는 **패턴과 구현 기법을 구분**하는 것이 중요합니다.

### 내부 자기 호출은 바깥 Proxy를 다시 통과하지 않을 수 있다

Proxy가 대상 객체 **밖**에 있다고 생각해 봅시다.

```text
Client -> Proxy -> Target.methodA()
                    │
                    └-> this.methodB()
```

`Target.methodA()` 안에서 `this.methodB()`를 호출하면 그 호출은 이미 target 내부에서 일어났으므로 바깥 Proxy reference를 다시 거치지 않을 수 있습니다.

이 구조는 Spring의 proxy 기반 AOP나 transaction을 이해할 때 중요하지만 Java 수준에서의 핵심은 간단합니다. **Proxy logic은 실제 호출이 Proxy object를 통해 들어올 때 실행됩니다.**

어떤 reference로 method를 호출하는지 call path를 그려 보면 self-invocation 문제를 이해하기 쉽습니다.

### Decorator와는 wrapper의 목적을 보고 구분한다

Decorator도 같은 interface의 target을 감쌀 수 있습니다. 구조만 보면 거의 같습니다.

```text
Client -> Wrapper -> Target
```

Decorator는 logging, compression처럼 **기능을 조합해 추가**하는 목적이 강하고, Proxy는 authorization, lazy creation, remote access처럼 **target 접근 자체를 대신 관리**하는 목적이 강합니다.

실제 Metrics wrapper처럼 둘 다 설명 가능한 경우도 있습니다. 중요한 것은 패턴 이름을 강제로 하나 붙이는 것이 아니라 그 wrapper의 변경 이유가 무엇인지 파악하는 것입니다.

### Adapter와는 계약 변환 여부가 다르다

Adapter는 외부 `VendorClient`를 내부 `PaymentGateway`처럼 사용하게 하면서 interface와 representation을 번역하는 것이 중심입니다. Proxy는 보통 client가 기대하는 **같은 역할을 유지**하고 그 역할에 접근하는 과정에 개입합니다.

```text
Adapter: Vendor API  -> Internal API
Proxy  : Same API -> access mediator -> Same-role target
```

Proxy를 리뷰할 때는 wrapper class의 코드만 보지 말고 실제 reference graph와 call sequence를 추적해야 합니다. 호출자가 target을 직접 얻을 수 있는지, 검사 전에 expensive side effect가 발생하지 않는지, lazy state가 언제 바뀌는지, 여러 thread가 같은 Proxy를 공유할 때 mutable state가 안전한지, 그리고 self-call이 Proxy를 다시 거치는지 확인합니다. Proxy의 핵심은 대리 객체 자체가 아니라 **실제 대상에 도달하는 경로를 통제하는 것**입니다.
