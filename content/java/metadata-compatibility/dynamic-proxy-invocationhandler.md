---
kind: concept
contentKey: java.core.metadata-compatibility.dynamic-proxy-invocationhandler
topicContentKey: java.core.metadata-compatibility
slug: dynamic-proxy-invocationhandler
title: "Dynamic proxy and InvocationHandler"
summary: "JDK dynamic proxy가 interface 호출을 InvocationHandler로 전달하는 구조를 이해하고 target 호출 전후에 공통 동작을 넣는 원리를 익힌다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Proxy.html"
    title: "Java SE 25 API: Proxy"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: interface-based proxy 생성과 호출 흐름 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/InvocationHandler.html"
    title: "Java SE 25 API: InvocationHandler"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: invoke callback contract 확인
---
# Proxy는 왜 실제 객체 앞에 하나를 더 둘까

서비스 method를 호출할 때마다 실행 시간을 재거나 권한을 검사하고 싶다고 해 보겠습니다. 각 method 본문에 같은 코드를 복사할 수도 있지만, 실제 객체 앞에 **대신 호출을 받는 객체(proxy)** 를 두면 공통 동작을 한곳에 모을 수 있습니다.

JDK dynamic proxy는 interface 기반으로 이런 proxy 객체를 runtime에 만들 수 있게 합니다.

### Caller는 target 대신 proxy를 호출한다

```text
Caller
  │
  ▼
Proxy
  │
  ├─ before logic
  │
  ▼
Target
  │
  ▼
result
  │
  └─ after logic
```

Caller 입장에서는 proxy도 같은 interface를 구현하므로 일반 객체처럼 사용할 수 있습니다.

```java
interface Greeter {
    String hello(String name);
}
```

실제 구현체가 있습니다.

```java
final class GreeterImpl implements Greeter {
    @Override
    public String hello(String name) {
        return "Hello " + name;
    }
}
```

### `Proxy.newProxyInstance`가 interface 구현체를 runtime에 만든다

```java
Greeter target = new GreeterImpl();

Greeter proxy = (Greeter) Proxy.newProxyInstance(
        Greeter.class.getClassLoader(),
        new Class<?>[]{Greeter.class},
        new LoggingHandler(target)
);
```

JDK proxy는 전달한 interface들을 구현하는 proxy class를 runtime에 구성합니다.

여기서 중요한 점은 **JDK dynamic proxy가 임의의 concrete class를 subclassing하는 API가 아니라 interface 기반 proxy**라는 것입니다.

Spring은 상황에 따라 class-based proxy도 지원하지만 그것은 Spring/framework proxy 선택 영역에서 다룹니다.

### 실제 호출은 InvocationHandler의 `invoke`로 들어온다

```java
final class LoggingHandler implements InvocationHandler {
    private final Object target;

    LoggingHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("before: " + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("after: " + method.getName());
        return result;
    }
}
```

Caller가:

```java
proxy.hello("Kim");
```

을 호출하면 개념적으로:

```text
proxy.hello("Kim")
      │
      ▼
InvocationHandler.invoke(
    proxy,
    hello Method,
    ["Kim"]
)
      │
      ├─ before
      ├─ target.hello(...)
      └─ after
```

로 흘러갑니다.

### `proxy`, `method`, `args`를 구분한다

`invoke`가 받는 세 값은 각각 의미가 다릅니다.

- `proxy`: caller가 실제로 호출한 proxy 객체
- `method`: 호출된 interface method의 reflection 정보
- `args`: caller가 넘긴 argument 배열

Target 객체는 자동으로 parameter에 따로 주어지는 것이 아닙니다. 위 예제처럼 handler가 target을 field로 가지고 있어야 실제 target 호출로 넘길 수 있습니다.

### 같은 signature가 여러 interface에 있으면 caller의 interface를 항상 복원할 수 있는 것은 아니다

하나의 proxy가 다음처럼 같은 signature의 method를 가진 여러 interface를 구현할 수도 있습니다.

```java
interface First {
    String find(String id);
}

interface Second {
    String find(String id);
}
```

이때 `InvocationHandler`에 전달된 `Method`의 `getDeclaringClass()`를 보고 **호출자가 First 타입의 참조로 호출했는지 Second 타입의 참조로 호출했는지를 항상 알아낼 수 있다고 가정하면 안 됩니다.** JDK `Proxy` API는 여러 proxy interface에 같은 이름과 매개변수 signature의 method가 있을 때, handler에 전달되는 `Method`의 declaring class가 실제 호출에 사용한 interface와 반드시 일치하지 않을 수 있음을 명시합니다.

따라서 두 interface의 같은 signature에 서로 다른 업무 의미를 부여하고, handler에서 caller가 사용한 interface identity를 추측해 routing하는 설계는 안전하지 않습니다. Proxy가 구현해야 하는 interface 계약과 target delegation 구조를 처음부터 명확하게 정하는 편이 낫습니다.

### proxy를 다시 호출하면 재귀에 빠질 수 있다

Handler 안에서 잘못해서 target이 아니라 proxy의 같은 method를 다시 호출한다고 생각해 보겠습니다.

```java
method.invoke(proxy, args);
```

그러면 proxy method 호출이 다시 `InvocationHandler.invoke()`로 들어와 무한 재귀가 생길 수 있습니다.

```text
proxy call
  -> handler
      -> proxy call
          -> handler
              -> proxy call ...
```

공통 로직 뒤에 실제 target을 호출하려는 것인지, proxy chain을 다시 통과시키려는 것인지 명확히 해야 합니다.

### 반환값과 예외 계약도 지켜야 한다

Handler는 아무 값이나 반환해도 되는 callback이 아닙니다. Proxy method의 return type과 맞는 결과를 반환해야 합니다.

```java
String hello(String name)
```

인데 handler가 `Integer`를 반환하면 caller 쪽에서 타입 문제가 발생할 수 있습니다.

또 target method가 예외를 던지면 reflection 호출 과정에서 wrapping될 수 있습니다. `InvocationTargetException` 내부 원인을 어떻게 전달할지, interface method의 checked exception contract와 proxy가 어떤 예외를 caller에게 보이게 할지를 이해해야 합니다.

JDK proxy의 exact exception wrapping 규칙은 `InvocationHandler`/`Proxy` API 문서를 기준으로 확인합니다.

### `equals`, `hashCode`, `toString`도 proxy 호출을 생각해야 한다

Proxy 객체도 Java 객체이므로 `equals`, `hashCode`, `toString` 호출이 발생합니다. Handler 구현에서 모든 method를 동일하게 target에 넘길지, proxy identity 의미를 별도로 둘지 생각해야 합니다.

Framework는 이런 기본 method 처리까지 자체 proxy semantics로 관리할 수 있습니다.

그래서 단순 데모 handler를 그대로 production proxy framework처럼 사용하면 예상하지 못한 behavior가 생길 수 있습니다.

### Spring transaction proxy 이해로 연결된다

Spring의 `@Transactional`을 아주 큰 구조로 단순화하면 다음과 비슷한 생각을 할 수 있습니다.

```text
Controller
    │
    ▼
Transactional Proxy
    │ transaction begin
    ▼
Service Target
    │
    ▼
return
    │ commit/rollback
```

물론 Spring AOP는 JDK `Proxy` 하나만으로 설명되는 전체 기능이 아닙니다. Class-based proxy, advisor, interceptor, Bean lifecycle 같은 framework 개념이 더 있습니다.

하지만 **caller가 target을 직접 호출하지 않고 proxy를 거쳐야 interception이 일어난다**는 Java 기반 mental model은 self-invocation 문제를 이해하는 데 큰 도움이 됩니다.

### proxy 밖에서 target을 직접 호출하면 interception되지 않는다

```java
Greeter target = new GreeterImpl();
Greeter proxy = createProxy(target);

proxy.hello("A");  // handler 통과
target.hello("B"); // handler 통과하지 않음
```

Proxy를 만들었다고 target object의 모든 호출이 전 세계적으로 자동 intercept되는 것이 아닙니다. **실제 호출 경로가 proxy를 지나야 합니다.**

이 원리가 Spring AOP의 호출 경계에서도 중요합니다.

### 문제를 풀 때 확인할 것

1. caller가 proxy reference를 호출하는지 target을 직접 호출하는지 확인합니다.
2. JDK dynamic proxy가 어떤 interface를 구현하는지 봅니다.
3. `invoke`의 proxy/method/args 역할을 구분합니다.
4. 같은 signature를 가진 여러 interface가 있다면 `Method.getDeclaringClass()`로 caller-interface identity를 항상 복원할 수 있다고 가정하지 않습니다.
5. handler가 target 대신 proxy를 다시 호출해 재귀하지 않는지 봅니다.
6. 반환 타입과 exception contract를 확인합니다.
7. JDK proxy mechanism과 Spring AOP 전체 behavior를 같은 것으로 보지 않습니다.

### 면접에서 설명한다면

JDK dynamic proxy는 runtime에 interface 구현 proxy를 만들고 proxy의 method 호출을 `InvocationHandler.invoke`로 전달합니다. Handler는 호출된 `Method`와 arguments를 보고 logging, authorization 같은 공통 동작을 수행한 뒤 실제 target을 호출할 수 있습니다. Caller가 반드시 proxy를 통해 호출해야 interception이 일어나며, JDK dynamic proxy는 interface 기반입니다. 여러 interface가 같은 method signature를 가진 경우에는 handler에 전달된 `Method`만으로 호출자가 사용한 interface를 항상 식별할 수 없다는 제한도 있습니다. 이 구조는 Spring transaction/AOP proxy를 이해하는 Java 수준의 기반이 됩니다.
