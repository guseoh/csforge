---
kind: concept
contentKey: java.core.api-design.dependency-injection-construction
topicContentKey: java.core.api-design
slug: dependency-injection-construction
title: "의존성을 밖에서 전달하는 설계"
summary: "객체가 필요한 협력자를 내부에서 숨겨 찾기보다 생성 시 명시적으로 전달해 결합도와 테스트 가능성을 개선한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/tutorial/java/javaOO/constructors.html"
    title: "Oracle Java Tutorials: Providing Constructors for Your Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 생성자를 통한 객체 구성의 기본 참고
---
# 의존성을 밖에서 전달하는 설계

어떤 객체가 일을 하기 위해 다른 객체가 필요하다면 그 다른 객체를 **의존성(dependency)** 이라고 부릅니다. 문제는 의존성이 있다는 사실이 아니라, 그 의존성이 코드에서 보이지 않거나 특정 구현으로 단단히 고정되어 있을 때 생깁니다.

### 내부에서 직접 만들어 버리면 선택 책임까지 떠안는다

```java
class OrderService {
    private final EmailSender sender = new SmtpEmailSender();

    void complete(Order order) {
        sender.send(order);
    }
}
```

`OrderService`는 주문 완료뿐 아니라 어떤 이메일 구현을 사용할지까지 결정합니다. `SmtpEmailSender`의 생성 방식이 바뀌거나 테스트에서 가짜 구현을 사용하고 싶을 때 `OrderService` 코드가 함께 영향을 받습니다.

### 필요한 협력자를 생성자로 받는다

```java
class OrderService {
    private final EmailSender sender;

    OrderService(EmailSender sender) {
        this.sender = sender;
    }
}
}
```

이제 `OrderService`는 자신에게 `EmailSender`가 필요하다는 사실만 알고, 어떤 구현을 만들지는 외부에 맡깁니다.

```java
EmailSender sender = new SmtpEmailSender(...);
OrderService service = new OrderService(sender);
```

```text
구성하는 코드
 ├─ SmtpEmailSender 생성
 └─ OrderService 생성
          │
          └─ EmailSender를 전달
```

이처럼 필요한 객체를 외부에서 전달하는 것을 **의존성 주입(Dependency Injection, DI)** 이라고 합니다.

### 테스트가 쉬워지는 이유

```java
class FakeEmailSender implements EmailSender {
    int callCount;

    @Override
    public void send(Order order) {
        callCount++;
    }
}
```

테스트에서는 실제 메일 서버에 연결하지 않고 `FakeEmailSender`를 전달할 수 있습니다. 핵심은 “mock을 쓰기 위해 DI를 한다”가 아니라 **객체가 특정 구현 생성 책임에서 분리되었기 때문에 다른 협력자를 넣을 수 있게 된 것**입니다.

### Spring DI보다 먼저 이해해야 할 것

Spring은 Bean을 만들고 이런 의존성을 자동으로 연결해 줄 수 있습니다. 하지만 DI 자체는 Spring 기능이 아닙니다. 위 코드는 순수 Java만으로도 완전한 DI입니다.

그래서 Spring을 공부할 때도 `@Autowired` 같은 애너테이션을 외우기 전에 **누가 객체를 만들고, 누가 구현을 선택하며, 누가 연결하는가**를 구분해야 합니다.

### 모든 객체를 인터페이스로 바꿀 필요는 없다

DI는 구현 교체가 필요한 모든 곳에 인터페이스를 강제하는 규칙이 아닙니다. 구체 클래스 자체가 안정된 협력자라면 생성자로 구체 타입을 받아도 의존성이 명시된다는 장점은 그대로 있습니다.

좋은 질문은 “인터페이스를 만들었나?”가 아니라 **이 객체가 필요한 협력자를 숨겨서 직접 찾거나 생성하고 있지는 않은가?** 입니다.
