---
kind: concept
contentKey: java.core.metadata-compatibility.dynamic-proxy-invocationhandler
topicContentKey: java.core.metadata-compatibility
slug: dynamic-proxy-invocationhandler
title: "동적 프록시와 InvocationHandler"
summary: "JDK 동적 프록시가 인터페이스 호출을 InvocationHandler로 전달하는 구조를 이해하고 대상 객체 호출 전후에 공통 동작을 적용하는 원리를 익힌다"
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
# 동적 프록시와 InvocationHandler

여러 service 메서드 호출 앞뒤에 logging, 권한 검사, transaction 같은 공통 동작을 넣고 싶을 때 각 대상 메서드를 직접 수정하는 대신 **대상 앞에 proxy를 두고 호출을 중계**할 수 있습니다.

JDK 동적 프록시는 실행 시 인터페이스를 구현하는 프록시 객체를 만들고, 프록시 메서드 호출을 `InvocationHandler` 하나로 전달합니다.

![호출자가 JDK 프록시와 InvocationHandler를 거쳐 대상 객체를 호출하는 흐름](/learning/java/dynamic-proxy-flow.svg)

### 호출자는 대상 객체가 아니라 같은 인터페이스의 프록시를 사용한다

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

JDK `Proxy`는 전달된 인터페이스를 구현하는 프록시 클래스를 실행 시점에 구성합니다. 핵심은 **임의의 구체 클래스를 상속하는 API가 아니라 인터페이스 기반 프록시**라는 점입니다.

```text
호출자
  │
  ▼
프록시 (Greeter)
  │
  ▼
InvocationHandler
  │
  ▼
대상 객체
```

### 실제 메서드 호출은 `InvocationHandler.invoke`로 전달된다

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

`proxy.hello("Kim")`을 호출하면 핸들러는 프록시 객체, 호출된 `Method`, 인수 배열을 받습니다. 대상 객체는 자동으로 전달되지 않으므로 핸들러가 직접 보유하거나 다른 방법으로 찾아야 합니다.

### 대상 객체 대신 프록시를 다시 호출하면 재귀할 수 있다

```java
method.invoke(proxy, args);
```

위처럼 핸들러가 같은 프록시를 다시 호출하면 호출이 `invoke()`로 되돌아와 무한 재귀가 생길 수 있습니다.

```text
프록시 호출
 -> handler
    -> 프록시 호출
       -> handler
          -> ...
```

공통 로직 뒤에 실제 대상 객체를 호출하려는지, 다른 프록시 체인을 의도적으로 거치려는지 분명히 해야 합니다.

### 프록시를 거치지 않은 호출은 가로채지지 않는다

```java
proxy.hello("A");   // handler 통과
target.hello("B");  // handler를 통과하지 않음
```

프록시를 생성했다고 대상 객체에 대한 모든 호출이 자동으로 가로채지는 것은 아닙니다. **호출자의 실제 호출 경로가 프록시를 지나야** 핸들러가 실행됩니다.

이 구조를 이해하면 Spring AOP의 자기 호출(self-invocation) 문제도 파악하기 쉽습니다. 다만 Spring의 클래스 기반 프록시, advisor, interceptor, Bean 생명주기까지 JDK `Proxy` 하나로 설명해서는 안 됩니다.

### 여러 인터페이스에 같은 시그니처가 있으면 선언 인터페이스를 단정할 수 없다

하나의 프록시가 여러 인터페이스에서 이름과 매개변수 시그니처가 같은 메서드를 구현할 수 있습니다.

```java
interface First  { String find(String id); }
interface Second { String find(String id); }
```

Java `Proxy` API는 이런 중복 메서드 호출에서 핸들러에 전달되는 `Method`의 선언 클래스가 **호출자가 사용한 인터페이스 참조와 반드시 일치하지는 않는다**고 명시합니다. 프록시가 구현하는 인터페이스 목록에서 앞선 인터페이스의 메서드가 전달될 수 있습니다.

따라서 `method.getDeclaringClass()`만 보고 호출자가 `First`와 `Second` 중 어느 인터페이스를 거쳤는지 판별해 분기하는 설계는 안전하지 않습니다.

### 반환값과 검사 예외도 인터페이스 계약을 따라야 한다

핸들러의 반환값은 프록시 메서드의 반환 타입과 호환되어야 합니다. 검사 예외도 프록시가 구현하는 인터페이스 메서드의 `throws` 계약을 벗어나면 `UndeclaredThrowableException` 같은 실행 시점 예외가 발생할 수 있습니다.

즉 `InvocationHandler`는 어떤 값이나 예외든 반환해도 되는 콜백이 아니라 **프록시가 공개하는 인터페이스 계약을 대신 지켜야 하는 호출 경계**입니다.

### 정리

JDK 동적 프록시는 실행 시 인터페이스를 구현하는 프록시 객체를 만들고 메서드 호출을 `InvocationHandler.invoke`로 전달합니다. 핸들러는 호출 전후에 공통 동작을 적용한 뒤 실제 대상 객체에 위임할 수 있습니다. 가로채기는 호출자가 프록시를 통해 호출할 때만 일어납니다. 중복 인터페이스 메서드의 선언 클래스나 검사 예외 계약처럼 JDK Proxy 고유의 규칙도 있습니다. 이 원리는 Spring의 프록시 기반 AOP를 이해하는 바탕이지만 Spring의 프록시 모델 전체와 같지는 않습니다.
