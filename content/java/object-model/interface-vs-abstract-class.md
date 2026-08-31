---
kind: concept
contentKey: java.core.object-model.interface-vs-abstract-class
topicContentKey: java.core.object-model
slug: interface-vs-abstract-class
title: "인터페이스와 추상 클래스 선택"
summary: "계약 중심의 다형성이 필요한 경우와 공통 상태·구현을 공유하는 클래스 계층이 필요한 경우를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 110
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 인터페이스 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: abstract class와 상속 규칙 확인
---
# 인터페이스와 추상 클래스 선택

인터페이스와 추상 클래스는 모두 직접 인스턴스화하지 않는 추상적인 타입을 만들 수 있지만 목적을 똑같이 보면 안 됩니다. 선택할 때는 “메서드 구현이 있느냐”보다 **여러 구현이 같은 계약을 따르게 할 것인지, 하나의 클래스 계층에서 공통 상태와 구현을 공유할 것인지**를 먼저 봅니다.

### 인터페이스는 역할과 계약을 표현하기 좋다

```java
interface PaymentProcessor {
    PaymentResult pay(Order order);
}
```

카드 결제와 계좌 결제가 서로 다른 클래스 계층에 있더라도 같은 `PaymentProcessor` 역할을 구현할 수 있습니다.

```java
class CardPaymentProcessor implements PaymentProcessor { ... }
class AccountPaymentProcessor implements PaymentProcessor { ... }
```

클래스는 하나의 클래스만 직접 확장할 수 있지만 여러 인터페이스를 구현할 수 있기 때문에, 인터페이스는 객체가 맡는 여러 역할을 표현하는 데 유리합니다.

현대 Java 인터페이스에는 `default`, `static`, `private` 메서드도 존재할 수 있으므로 “인터페이스에는 구현이 없다”라는 설명은 정확하지 않습니다.

### 추상 클래스는 공통 기반 구현과 상태를 가질 수 있다

```java
abstract class BaseJob {
    private final Clock clock;

    protected BaseJob(Clock clock) {
        this.clock = clock;
    }

    protected Instant now() {
        return clock.instant();
    }

    abstract void execute();
}
```

추상 클래스는 인스턴스 필드, 생성자, protected 구현을 가지면서 하위 클래스에 공통 기반을 제공할 수 있습니다. 즉 단순 계약뿐 아니라 **하나의 계층에서 공유할 상태와 구현이 실제로 있는 경우**가 자연스럽습니다.

### 선택 기준을 표로 보면

| 질문                                                     | 인터페이스가 자연스러운 경우 | 추상 클래스가 자연스러운 경우 |
| -------------------------------------------------------- | ---------------------------- | ----------------------------- |
| 여러 unrelated 타입이 같은 역할을 해야 하나              | 예                           | 보통 아님                     |
| 인스턴스 상태를 공통으로 관리해야 하나                   | 직접 상태 보유 불가          | 가능                          |
| 공통 생성 과정이 필요한가                                | 생성자 없음                  | 가능                          |
| 다른 클래스 상속과 함께 사용해야 하나                    | 유리                         | 클래스 상속 제약 발생         |
| 하위 타입이 하나의 공통 기반 구현에 강하게 묶여도 되는가 | 덜 묶임                      | 그럴 때 적합                  |

### 인터페이스도 너무 잘게 나누면 문제가 된다

`Readable`, `Writable`, `Closable`처럼 의미 있는 역할 분리는 좋지만, 메서드 하나마다 무조건 인터페이스를 만드는 것이 좋은 설계는 아닙니다. 호출자가 어떤 계약을 필요로 하는지에 따라 추상화 수준을 정해야 합니다.

### Spring을 쓰기 위해 인터페이스가 필요한 것은 아니다

Spring DI나 AOP 때문에 모든 서비스에 인터페이스가 필수라고 생각할 필요는 없습니다. Spring은 구체 클래스 Bean도 관리할 수 있습니다. 인터페이스는 **도메인 역할, 구현 교체, 경계 분리 등 설계상 이유가 있을 때** 사용해야 합니다.

면접에서는 “다중 상속이 필요하면 인터페이스” 한 문장보다, 인터페이스는 역할·계약 중심이고 추상 클래스는 공통 상태와 기반 구현을 공유하는 클래스 계층에 적합하다고 설명하는 편이 훨씬 좋습니다.
