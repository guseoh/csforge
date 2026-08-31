---
kind: concept
contentKey: java.core.design-patterns.proxy-pattern
topicContentKey: java.core.design-patterns
slug: proxy-pattern
title: "Proxy와 호출 중개"
summary: "실제 객체 앞에서 접근 제어·지연 로딩·원격 호출·부가 작업을 수행하는 대리 객체의 역할과 한계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Proxy.html"
    title: "Java SE 25 API: Proxy"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JDK 동적 Proxy API 확인
---
# Proxy와 호출 중개

호출자가 실제 객체를 직접 부르지 않고 **같은 계약을 가진 대리 객체를 먼저 거치게 하는 구조**를 Proxy라고 합니다.

```text
Client
  │
  ▼
Proxy
  │ 검사 / 기록 / 로딩 / 원격 전달
  ▼
Real Object
```

호출자는 가능한 한 실제 객체와 Proxy를 같은 계약으로 사용합니다.

```java
interface Repository {
    Order find(long id);
}
```

```java
class LoggingRepositoryProxy implements Repository {
    private final Repository target;

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

### Proxy가 맡는 대표 역할

- 실제 객체 접근 전에 권한 확인
- 필요할 때까지 실제 데이터 로딩 지연
- 원격 시스템 호출을 로컬 객체 호출처럼 감싸기
- 호출 시간 측정이나 공통 부가 처리

핵심은 실제 객체의 비즈니스 책임을 대신 구현하는 것이 아니라 **그 객체에 접근하는 과정에 중개 책임을 추가하는 것**입니다.

### Proxy가 있으면 자기 호출이 달라질 수 있다

프레임워크가 객체 밖에 Proxy를 두고 메서드 호출을 가로채는 경우, 대상 객체 내부에서 `this.otherMethod()`를 호출하면 Proxy를 다시 통과하지 않을 수 있습니다. 이 현상은 Spring의 `@Transactional` 같은 프록시 기반 기능을 이해할 때 중요합니다.

다만 그 구체적인 Spring 동작은 Spring 영역에서 다룹니다. Java 여기서는 **호출자가 Proxy 참조를 통해 들어올 때만 Proxy의 중개 로직이 실행될 수 있다**는 구조를 이해하면 됩니다.

### JDK 동적 Proxy는 패턴의 한 구현 방법이다

`java.lang.reflect.Proxy`는 런타임에 인터페이스 기반 proxy 객체를 만들 수 있는 JDK API입니다. 하지만 Proxy 패턴 자체가 JDK 동적 Proxy를 뜻하는 것은 아닙니다. 직접 클래스를 작성해도 Proxy 구조를 만들 수 있습니다.

### Decorator와 구분할 때

둘 다 target을 감싸므로 구조는 닮았습니다. Decorator는 기능 조합, Proxy는 접근 중개·제어 목적이 더 강합니다. 실제 설계에서는 이름보다 **이 객체가 추가 기능을 구성하는가, 대상 접근을 대신 관리하는가**를 보세요.
