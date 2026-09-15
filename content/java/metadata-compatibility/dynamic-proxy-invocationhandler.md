---
kind: concept
contentKey: java.core.metadata-compatibility.dynamic-proxy-invocationhandler
topicContentKey: java.core.metadata-compatibility
slug: dynamic-proxy-invocationhandler
title: "Dynamic Proxy와 InvocationHandler"
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
# Dynamic Proxy와 InvocationHandler

여러 service method 호출 앞뒤에 logging, 권한 검사, transaction 같은 공통 동작을 넣고 싶을 때 각 target method를 직접 수정하는 대신 **target 앞에 proxy를 두고 호출을 중계**할 수 있습니다.

JDK dynamic proxy는 runtime에 interface 구현 proxy를 만들고, proxy method 호출을 `InvocationHandler` 하나로 전달합니다.

![Caller가 JDK Proxy와 InvocationHandler를 거쳐 target을 호출하는 흐름](/learning/java/dynamic-proxy-flow.svg)

### Caller는 target이 아니라 같은 interface의 proxy를 본다

```java
interface Greeter {
    String hello(String name);
}
```

```java
Greeter target = new GreeterImpl();

Greeter proxy = (Greeter) Proxy.newProxyInstance(
        Greeter.class.getClassLoader(),
        new Class<?>[]{Greeter.class},
        new LoggingHandler(target)
);
```

JDK `Proxy`는 전달된 interface들을 구현하는 proxy class를 runtime에 구성합니다. 핵심은 **임의의 concrete class를 subclassing하는 API가 아니라 interface 기반 proxy**라는 점입니다.

```text
Caller
  │
  ▼
Proxy (Greeter)
  │
  ▼
InvocationHandler
  │
  ▼
Target
```

### 실제 method 호출은 `InvocationHandler.invoke`로 들어온다

```java
final class LoggingHandler implements InvocationHandler {
    private final Object target;

    LoggingHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("before");
        Object result = method.invoke(target, args);
        System.out.println("after");
        return result;
    }
}
```

`proxy.hello("Kim")`을 호출하면 handler는 proxy 객체, 호출된 `Method`, argument 배열을 받습니다. Target은 자동 parameter로 주어지는 것이 아니므로 handler가 직접 보유하거나 다른 방식으로 찾아야 합니다.

### Target 대신 proxy를 다시 호출하면 재귀할 수 있다

```java
method.invoke(proxy, args);
```

위처럼 handler가 같은 proxy를 다시 호출하면 호출이 다시 `invoke()`로 돌아와 무한 재귀가 생길 수 있습니다.

```text
proxy call
 -> handler
    -> proxy call
       -> handler
          -> ...
```

공통 로직 뒤에 실제 target을 호출하려는 것인지, 의도적으로 다른 proxy chain을 거칠 것인지 명확해야 합니다.

### Proxy를 거치지 않은 호출은 interception되지 않는다

```java
proxy.hello("A");   // handler 통과
target.hello("B");  // handler를 통과하지 않음
```

Proxy를 생성했다고 target에 대한 모든 호출이 자동으로 intercept되는 것은 아닙니다. **실제 caller의 호출 경로가 proxy를 지나야** handler가 실행됩니다.

이 mental model은 Spring AOP의 self-invocation 문제를 이해할 때도 중요합니다. 다만 Spring의 class-based proxy, advisor, interceptor, Bean lifecycle까지 JDK `Proxy` 하나로 설명하면 안 됩니다.

### 여러 interface에 같은 signature가 있으면 declaring interface를 추측하면 안 된다

하나의 proxy가 같은 name과 parameter signature를 가진 method를 여러 interface에서 구현할 수 있습니다.

```java
interface First  { String find(String id); }
interface Second { String find(String id); }
```

Java `Proxy` API는 이런 duplicate method 호출에서 handler에 전달되는 `Method`의 declaring class가 **caller가 사용한 interface reference와 반드시 일치하지 않는다**고 명시합니다. Proxy가 구현하는 interface 목록에서 먼저 오는 쪽의 method가 전달될 수 있습니다.

따라서 `method.getDeclaringClass()`만 보고 caller가 `First`를 통해 호출했는지 `Second`를 통해 호출했는지 routing하는 설계는 안전하지 않습니다.

### 반환값과 checked exception도 interface 계약을 따라야 한다

Handler가 반환하는 값은 proxy method의 return type과 호환되어야 합니다. Checked exception도 proxy가 구현하는 interface method들의 `throws` 계약을 벗어나면 `UndeclaredThrowableException` 같은 runtime 결과가 나타날 수 있습니다.

즉 `InvocationHandler`는 아무 값과 예외를 반환해도 되는 callback이 아니라 **proxy가 노출하는 interface 계약을 대신 지켜야 하는 호출 경계**입니다.

### 정리

JDK dynamic proxy는 runtime에 interface 구현 proxy를 만들고 method 호출을 `InvocationHandler.invoke`로 전달합니다. Handler는 호출 전후 공통 behavior를 적용하고 실제 target으로 위임할 수 있습니다. Interception은 caller가 proxy를 통해 호출할 때만 일어나며, duplicate interface method의 declaring class나 checked exception contract 같은 JDK Proxy 고유 규칙도 존재합니다. 이 원리는 Spring proxy 기반 AOP를 이해하는 기반이지만 Spring 전체 proxy model과 동일한 것은 아닙니다.
