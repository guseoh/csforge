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
  │ 같은 계약
  ▼
Proxy
  │ 접근 조건·지연 생성·원격 전달 등
  ▼
실제 대상
```

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

### 핵심은 실제 대상에 접근하는 과정을 중개하는 것이다

Proxy가 맡을 수 있는 대표적인 책임은 다음과 같습니다.

- Protection Proxy: 실제 호출 전에 접근 권한을 검사한다.
- Virtual Proxy: 비싼 실제 객체 생성을 필요할 때까지 늦춘다.
- Remote Proxy: 원격 대상을 로컬 역할처럼 호출할 수 있게 중개한다.

공통점은 대상의 핵심 기능을 새로 정의하기보다 **그 기능에 도달하는 경로를 관리**한다는 점입니다.

### 호출 순서가 Proxy의 의미를 결정한다

권한 검사를 통과한 경우에만 비싼 target을 만들고 싶다면 다음 순서가 중요합니다.

```java
Result read(User user) {
    checkPermission(user);
    if (target == null) {
        target = createExpensiveTarget();
    }
    return target.read();
}
```

검사 전에 target을 만들면 거부된 호출도 비싼 생성을 일으킬 수 있습니다. Proxy에서는 “무슨 기능을 추가했는가”뿐 아니라 **검사·생성·실제 호출이 어떤 순서로 이루어지는가**를 따라가야 합니다.

또 Protection Proxy가 있어도 호출자가 실제 target 참조를 직접 얻을 수 있다면 정책을 우회할 수 있습니다.

```text
정상: Client → Proxy → Target
우회: Client ─────────→ Target
```

접근 제어가 목적이라면 민감한 대상에 도달하는 공개 경로가 모두 같은 정책을 통과하는지 확인해야 합니다.

### Proxy 패턴과 구현 기법을 구분한다

`java.lang.reflect.Proxy`는 런타임에 인터페이스 기반 프록시를 만들 수 있는 JDK API입니다. 하지만 Proxy 패턴이 곧 reflection 기반 동적 프록시를 뜻하는 것은 아닙니다. 앞의 `MeasuringRepositoryProxy`처럼 직접 클래스를 작성해도 같은 역할을 구현할 수 있습니다.

Proxy가 바깥 객체라면 실제 호출이 그 Proxy를 거칠 때만 Proxy 로직이 실행된다는 점도 중요합니다.

```text
Client → Proxy → Target.methodA()
                  └→ this.methodB()
```

`methodA()` 안의 `this.methodB()`는 이미 target 내부 호출이므로 바깥 Proxy를 다시 통과하는 호출과는 다릅니다. 이 call path는 이후 proxy 기반 AOP를 이해할 때도 중요한 기초가 됩니다.

Decorator와 구조는 비슷하지만 의도는 다릅니다. Decorator는 **같은 역할에 기능을 조합해 추가**하고, Proxy는 **실제 대상에 접근하는 과정을 대신 관리**하는 데 초점이 있습니다. 패턴 이름보다 wrapper가 왜 필요한지를 기준으로 구분하면 됩니다.
