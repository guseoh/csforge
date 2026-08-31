---
kind: concept
contentKey: java.core.metadata-compatibility.dynamic-proxy-invocationhandler
topicContentKey: java.core.metadata-compatibility
slug: dynamic-proxy-invocationhandler
title: "Dynamic proxy and InvocationHandler"
summary: "JDK dynamic proxy가 interface call을 InvocationHandler로 중계하는 구조를 이해하고 Spring proxy 학습을 위한 Java 기반을 만든다"
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
# Dynamic proxy와 InvocationHandler

## 쉬운 진입

interface를 호출하는 caller는 실제 구현 객체를 직접 부르는 대신 proxy를 통과할 수
있다. JDK dynamic proxy는 지정한 interface를 구현하는 runtime class와
InvocationHandler를 만들고, proxy method 호출을 handler의 invoke로 전달한다.

## 정확한 메커니즘

~~~
interface Greeter {
    String hello(String name);
}

Greeter proxy = (Greeter) Proxy.newProxyInstance(
        Greeter.class.getClassLoader(),
        new Class<?>[] { Greeter.class },
        (object, method, args) -> {
            before();
            return method.invoke(target, args);
        });
~~~

proxy는 interface 기반이므로 concrete class를 상속해 proxy로 만드는 API가 아니다.
handler는 proxy object, 호출된 Method, arguments를 받아 결과를 반환하거나 예외를
던진다. Object method인 equals/hashCode/toString과 checked exception wrapping까지
호출 계약을 고려해야 한다. target 호출 전후 logging이나 access check를 넣을 수 있지만,
재귀적으로 proxy를 다시 호출하는 실수와 반환 타입 불일치를 피한다.

이 Concept은 java.lang.reflect.Proxy의 mechanism만 다룬다. Spring AOP가 bean lifecycle,
pointcut, transaction을 어떻게 조합하는지는 framework behavior이며 여기서 JDK proxy와
같다고 일반화하지 않는다.

## 흔한 오해

- JDK dynamic proxy가 임의의 concrete class를 자동으로 subclassing하지 않는다.
- InvocationHandler가 호출 결과 타입과 예외 계약을 무시해도 되는 callback은 아니다.
- proxy를 만들었다고 target의 모든 호출이 자동으로 intercept되는 것은 아니다.
