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
---
# 의존성을 밖에서 전달하는 설계

객체가 일을 하기 위해 다른 객체가 필요하다면 그 협력자를 의존성(dependency)이라고 부릅니다. 의존성이 있다는 사실 자체는 문제가 아닙니다. 실제 프로그램은 수많은 객체가 서로 협력해서 동작합니다. 설계에서 중요한 것은 **누가 협력자를 만들고, 누가 어떤 구현을 쓸지 선택하며, 누가 그 협력자를 사용하는가**입니다.

다음 코드는 세 책임을 `OrderService` 안에 섞어 둡니다.

```java
class OrderService {
    private final EmailSender sender = new SmtpEmailSender(
            "smtp.example.com",
            587
    );

    void complete(Order order) {
        sender.send(order);
    }
}
```

`OrderService`는 주문 완료 유스케이스를 처리하면서 `SmtpEmailSender`를 생성하고, SMTP 구현을 선택하고, 서버 설정까지 알고 있습니다. 나중에 메일 SDK 생성 방식이 바뀌거나 테스트에서 네트워크를 사용하지 않는 sender가 필요하면 주문 서비스도 함께 수정됩니다.

문제는 `new`라는 문법이 아니라 **협력 사용 책임과 협력자 선택·생성 책임이 한 객체에 들어간 것**입니다.

## 생성자 주입은 의존성을 객체의 생성 계약으로 만든다

필요한 협력자를 생성자에서 받으면 `OrderService`는 자신이 어떤 역할을 필요로 하는지 드러내고, 실제 구현을 만드는 책임은 바깥으로 이동합니다.

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

조립하는 코드는 다음과 같습니다.

```java
EmailSender sender = new SmtpEmailSender(config);
OrderService service = new OrderService(sender);
```

책임을 흐름으로 보면 더 명확합니다.

```text
구성하는 코드(composition root)
  1. 어떤 구현을 쓸지 결정
  2. 구현 객체 생성
  3. OrderService에 전달
                 │
                 ▼
OrderService
  4. EmailSender 계약을 사용해 주문 완료 처리
```

이처럼 객체가 필요한 협력자를 외부에서 제공받는 구성을 의존성 주입(Dependency Injection, DI)이라고 합니다. DI는 Spring이 없어도 가능한 객체 설계입니다. Spring은 이 조립 과정을 컨테이너가 대신 관리해 줄 수 있는 도구일 뿐입니다.

## 생성자 주입의 장점은 “mock을 쓸 수 있다”보다 앞에 있다

테스트에서 fake나 mock을 넣기 쉬운 것은 분명한 장점입니다.

```java
class FakeEmailSender implements EmailSender {
    int callCount;

    @Override
    public void send(Order order) {
        callCount++;
    }
}

OrderService service = new OrderService(new FakeEmailSender());
```

하지만 이것은 더 근본적인 설계 변화의 결과입니다. `OrderService`가 `SmtpEmailSender`의 **생성 정책에서 분리**되었기 때문에 다른 구현을 넣을 수 있게 된 것입니다. production에서는 SMTP 구현을, 테스트에서는 fake를, 다른 실행 환경에서는 다른 구현을 선택할 수 있습니다.

그래서 “테스트를 위해 interface를 만든다”보다 먼저 **이 협력의 구현 선택이 현재 객체의 책임인가**를 물어야 합니다.

## `final` dependency는 협력자의 내부 상태까지 불변으로 만들지 않는다

생성자 주입과 `final` 필드를 함께 쓰면 `OrderService`가 생성된 뒤 다른 sender 참조로 재대입되는 것을 막을 수 있습니다. 하지만 전달받은 객체 자체가 mutable하다면 그 내부 상태는 여전히 바뀔 수 있습니다.

```java
class Rate {
    int value = 2;
}

class Price {
    private final Rate rate;

    Price(Rate rate) {
        this.rate = rate;
    }

    int quote(int n) {
        return rate.value * n;
    }
}
```

```java
Rate shared = new Rate();
Price a = new Price(shared);
Price b = new Price(shared);

shared.value = 3;
```

`a`와 `b`는 둘 다 같은 `Rate`를 가리키므로 이후 계산에서 변경된 값 3을 봅니다. `final`은 `a.rate = anotherRate` 같은 **참조 재대입**을 막을 뿐, 공유된 `Rate`의 내부 mutation이나 thread-safety를 보장하지 않습니다.

따라서 DI 설계에서는 타입뿐 아니라 **협력자의 수명과 가변성**도 같이 봐야 합니다.

## 객체 수명도 조립 책임의 일부다

어떤 협력자는 여러 서비스가 안전하게 공유할 수 있습니다. 예를 들어 상태가 없는 formatter나 immutable policy는 한 객체를 공유해도 의미가 자연스러울 수 있습니다. 반대로 요청마다 상태를 누적하는 객체를 singleton처럼 공유하면 서로 다른 작업의 상태가 섞일 수 있습니다.

```text
같은 구현을 주입한다
        ≠
반드시 같은 instance를 공유해야 한다
```

DI는 “객체를 외부에서 넘긴다”는 구조를 제공하지만 singleton, request scope, prototype 같은 수명을 자동으로 정답으로 만들어 주지 않습니다. 어떤 state를 누가 소유하는지에 따라 조립자가 적절한 수명을 선택해야 합니다.

## interface는 DI의 필수 조건이 아니다

다음 코드도 의존성 주입입니다.

```java
class ReportService {
    private final CsvFormatter formatter;

    ReportService(CsvFormatter formatter) {
        this.formatter = formatter;
    }
}
```

구체 클래스 자체가 안정된 협력자이고 대체 구현을 공통 역할로 다룰 이유가 없다면 굳이 `Formatter` interface를 새로 만들 필요가 없습니다. 생성 책임은 여전히 외부로 분리되어 있고 의존성도 명시되어 있습니다.

interface의 가치가 커지는 것은 다음처럼 **실제 변동 경계**가 있을 때입니다.

```java
interface PaymentGateway {
    PaymentResult authorize(Payment payment);
}
```

외부 PG 구현이 바뀔 수 있거나 fake 구현을 같은 역할로 사용해야 한다면 호출자는 `PaymentGateway`라는 계약에 의존하는 편이 좋습니다. 반대로 구현 하나뿐인 내부 계산 class마다 interface를 만들면 타입 수만 늘 수 있습니다.

## DI와 Service Locator는 의존성 가시성이 다르다

다음처럼 메서드 안에서 전역 registry나 container를 직접 조회할 수도 있습니다.

```java
void complete(Order order) {
    EmailSender sender = Registry.get(EmailSender.class);
    sender.send(order);
}
```

이 방식도 외부 어딘가에서 객체를 등록할 수는 있지만, `OrderService`의 생성자만 봐서는 `EmailSender`가 필요하다는 사실을 알기 어렵습니다. 테스트도 호출 전에 전역 registry 상태를 맞춰야 할 수 있습니다.

생성자 주입은 **필수 협력자를 타입의 생성 계약에 드러낸다**는 점이 중요합니다. 객체가 만들어졌다면 필요한 협력자가 이미 연결되어 있다는 전제를 세우기 쉽습니다.

## 선택적 의존성이 많아지면 책임 자체를 다시 봐야 한다

생성자에 협력자가 계속 늘어난다고 해서 DI가 실패한 것은 아닙니다. 한 use case가 실제로 여러 시스템을 조정한다면 여러 의존성이 필요할 수 있습니다. 하지만 서로 관련 없는 협력자가 계속 추가된다면 class가 여러 책임을 한곳에 모으고 있다는 신호일 수도 있습니다.

```java
OrderService(
    OrderRepository repository,
    PaymentGateway paymentGateway,
    EmailSender sender,
    MetricsRecorder metrics,
    CsvExporter exporter,
    ImageResizer imageResizer,
    ...
)
```

이때 “생성자가 길어서 field injection으로 숨기자”가 해결책은 아닙니다. 먼저 이 객체가 정말 하나의 응집된 책임을 갖는지 검토해야 합니다. 생성자 주입은 오히려 과도한 의존성을 **눈에 보이게 하는 진단 도구**가 되기도 합니다.

## 순환 의존성은 객체 책임이 꼬였다는 신호가 될 수 있다

`A`가 `B`를 필요로 하고 `B`도 `A`를 필수 생성자 인자로 요구하면 두 객체 중 어느 것을 먼저 완성해야 할지 문제가 됩니다.

```text
A ──needs──> B
^            │
└──needs─────┘
```

프레임워크의 지연 주입이나 provider로 기술적으로 우회할 수 있는 경우도 있지만, 먼저 두 객체의 책임 분리가 잘못된 것은 아닌지 확인해야 합니다. 공통 정책을 제3의 객체로 분리하거나 collaboration 방향을 한쪽으로 정리하면 순환 자체가 사라질 수 있습니다.

## 백엔드 코드에서는 “누가 조립하는가”를 분리해서 본다

Spring 애플리케이션에서는 container가 Bean을 생성하고 생성자 의존성을 연결합니다. 그래도 설계 판단은 순수 Java와 같습니다.

```java
@Service
class OrderService {
    private final PaymentGateway paymentGateway;

    OrderService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }
}
```

여기서 핵심은 `@Service`나 자동 주입 문법이 아닙니다. `OrderService`는 결제 구현의 생성 방법을 모르고 **PaymentGateway가 제공해야 할 책임만 사용**합니다. 반대로 서비스 내부에서 SDK client를 직접 `new`하거나 static singleton을 찾아가면 Spring을 쓰더라도 DI의 설계 경계를 약하게 만들 수 있습니다.

의존성 주입을 검토할 때는 결국 세 가지를 추적하면 됩니다. **어떤 객체가 협력자를 사용하고, 어떤 바깥 경계가 구현과 수명을 선택하며, 그 선택이 바뀌어도 사용 객체의 핵심 책임이 유지되는가.** 이 구분이 명확할 때 DI는 단순한 프레임워크 기능이 아니라 결합도를 관리하는 객체 설계가 됩니다.
