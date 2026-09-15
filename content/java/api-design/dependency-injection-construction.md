---
kind: concept
contentKey: java.core.api-design.dependency-injection-construction
topicContentKey: java.core.api-design
slug: dependency-injection-construction
title: "의존성을 밖에서 전달하는 설계"
summary: "객체 생성·구현 선택·협력 사용 책임을 분리하고, 생성자 주입이 의존성 가시성·대체 가능성·수명 관리에 어떤 경계를 만드는지 이해한다"
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
  - url: "https://tecoble.techcourse.co.kr/post/2021-04-27-dependency-injection/"
    title: "의존관계 주입(Dependency Injection) 쉽게 이해하기"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: 의존 객체의 선택과 생성을 외부로 옮기는 DI 구조를 한국어 예제로 복습
---
# 의존성을 밖에서 전달하는 설계

객체가 일을 하기 위해 다른 객체가 필요하다면 그 협력자를 의존성(dependency)이라고 부를 수 있습니다. 의존성이 있다는 사실 자체는 문제가 아닙니다. 중요한 것은 **협력자를 누가 만들고 어떤 구현을 선택하며, 실제 업무 객체는 어디까지 알아야 하는가**입니다.

다음 `OrderService`는 메일을 보내는 일뿐 아니라 SMTP 구현을 만들고 설정하는 책임까지 가지고 있습니다.

```java
class OrderService {
    private final EmailSender sender = new SmtpEmailSender(config);

    void complete(Order order) {
        sender.send(order);
    }
}
```

메일 구현의 생성 방식이 바뀌면 주문 서비스도 함께 바뀝니다. 문제는 `new`라는 문법 자체가 아니라 **협력자 사용과 협력자 선택·생성 책임이 같은 객체에 섞여 있다는 점**입니다.

### 생성자에서 협력자를 받으면 필요한 의존성이 드러난다

```java
class OrderService {
    private final EmailSender sender;

    OrderService(EmailSender sender) {
        this.sender = Objects.requireNonNull(sender);
    }

    void complete(Order order) {
        sender.send(order);
    }
}
```

객체를 조립하는 코드는 실제 구현을 선택해 전달합니다.

```java
EmailSender sender = new SmtpEmailSender(config);
OrderService service = new OrderService(sender);
```

```text
조립하는 코드
 ├─ 구현 선택
 ├─ 객체 생성
 └─ 협력자 전달
        │
        ▼
OrderService
 └─ EmailSender 계약을 사용
```

이처럼 객체가 필요한 협력자를 외부에서 제공받는 구성을 **의존성 주입(Dependency Injection, DI)** 이라고 합니다. Spring 같은 컨테이너가 없어도 순수 Java로 구현할 수 있습니다. 프레임워크는 객체 조립을 자동화할 수 있지만 DI라는 설계 관계 자체를 만드는 것은 아닙니다.

### 대체 가능성은 생성 책임을 분리한 결과다

테스트에서는 다음처럼 다른 구현을 전달할 수 있습니다.

```java
class FakeEmailSender implements EmailSender {
    @Override
    public void send(Order order) {
        // 외부 네트워크 없이 기록
    }
}

OrderService service = new OrderService(new FakeEmailSender());
```

이것은 단순히 “mock을 쓰기 위해 DI한다”는 의미가 아닙니다. `OrderService`가 `SmtpEmailSender`의 생성 정책에서 분리되었기 때문에 실행 환경에 따라 다른 구현을 선택할 수 있게 된 것입니다.

인터페이스가 DI의 필수 조건도 아닙니다.

```java
class ReportService {
    private final CsvFormatter formatter;

    ReportService(CsvFormatter formatter) {
        this.formatter = formatter;
    }
}
```

구체 클래스 자체가 안정적인 협력자라면 그대로 전달받아도 생성 책임은 외부에 있습니다. 인터페이스는 실제로 여러 구현을 같은 역할로 다루거나 외부 경계를 별도 계약으로 보호할 이유가 있을 때 선택하면 됩니다.

### `final` 참조와 객체의 수명은 별개다

```java
private final EmailSender sender;
```

`final`은 서비스가 생성된 뒤 `sender` 필드에 다른 참조를 다시 넣지 못하게 합니다. 전달받은 `EmailSender` 객체 자체를 불변으로 만들거나 thread-safe하게 만드는 것은 아닙니다.

또한 외부에서 주입한다는 사실만으로 같은 인스턴스를 항상 공유해야 하는 것도 아닙니다. 상태가 없는 협력자는 하나를 공유해도 자연스러울 수 있지만 요청별 상태를 보관하는 가변 객체라면 수명을 다르게 설계해야 할 수 있습니다. **어떤 상태를 누가 소유하는가**에 따라 객체 수명을 결정해야 합니다.

### 숨겨진 조회보다 필요한 의존성을 생성 계약에 드러내기

```java
void complete(Order order) {
    EmailSender sender = Registry.get(EmailSender.class);
    sender.send(order);
}
```

이런 전역 조회 방식은 메서드 내부를 읽기 전까지 `OrderService`가 무엇을 필요로 하는지 알기 어렵습니다. 생성자에서 필수 협력자를 받으면 객체를 만드는 시점에 필요한 의존성이 드러나고, 완성된 객체가 필요한 협력자를 갖고 있다는 전제를 세우기 쉽습니다.

생성자 인자가 지나치게 많아졌다면 주입 방식 자체를 숨기기보다 **한 객체가 서로 다른 책임을 너무 많이 맡고 있지 않은지**도 살펴볼 수 있습니다.

DI를 이해할 때는 세 가지를 분리하면 됩니다. **협력자를 사용하는 객체, 구현과 수명을 선택하는 조립 지점, 두 객체 사이의 계약**입니다. 이 경계가 분명하면 DI는 프레임워크 문법이 아니라 객체 간 결합을 관리하는 설계가 됩니다.
