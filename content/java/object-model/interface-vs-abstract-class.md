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

인터페이스와 추상 클래스는 모두 추상적인 타입을 표현할 수 있지만, 선택 기준은 단순히 “구현이 있느냐”가 아닙니다. 먼저 **여러 타입이 같은 역할과 계약을 제공해야 하는지, 하나의 클래스 계층에서 공통 상태와 기반 구현을 공유해야 하는지**를 봐야 합니다.

### 인터페이스는 역할과 계약을 표현하기 좋다

```java
interface PaymentProcessor {
    PaymentResult pay(Order order);
}

class CardPaymentProcessor implements PaymentProcessor { ... }
class AccountPaymentProcessor implements PaymentProcessor { ... }
```

두 구현이 서로 다른 클래스 계층에 있어도 같은 `PaymentProcessor` 역할을 제공할 수 있습니다. 클래스는 하나의 클래스만 직접 확장할 수 있지만 여러 인터페이스를 구현할 수 있으므로, 인터페이스는 객체가 맡는 역할을 타입으로 표현할 때 유용합니다.

현대 Java 인터페이스에는 `default`, `static`, `private` 메서드도 둘 수 있습니다. 따라서 “인터페이스에는 구현이 없다”는 설명은 정확하지 않습니다. 핵심은 **인스턴스 상태와 생성 과정을 공유하는 기반 클래스가 아니라, 구현 타입들이 따라야 할 계약을 표현한다는 점**입니다.

### 추상 클래스는 공통 상태와 기반 구현을 가질 수 있다

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

추상 클래스는 인스턴스 필드와 생성자를 가지고, 하위 클래스가 함께 사용할 `protected` 구현도 제공할 수 있습니다. 즉 하나의 클래스 계층에서 **공통 상태·생성 과정·기반 동작을 실제로 공유해야 할 때** 자연스럽습니다.

| 질문 | 인터페이스가 자연스러운 경우 | 추상 클래스가 자연스러운 경우 |
| --- | --- | --- |
| 서로 다른 클래스들이 같은 역할을 맡아야 하는가 | 예 | 보통 아님 |
| 공통 인스턴스 상태를 직접 보유해야 하는가 | 아니오 | 가능 |
| 공통 생성 과정이 필요한가 | 생성자 없음 | 가능 |
| 다른 클래스 상속과 함께 사용해야 하는가 | 유리 | 클래스 상속 제약이 생김 |
| 하나의 공통 기반 구현에 묶이는 것이 의미 있는가 | 필수 아님 | 그럴 때 적합 |

### 둘 다 기계적으로 만들 필요는 없다

인터페이스를 메서드 하나마다 쪼개거나, 구현체가 생길 가능성만으로 모든 클래스 앞에 인터페이스를 두면 타입 수만 늘고 흐름을 읽기 어려워질 수 있습니다. 반대로 구현체가 현재 하나뿐이라는 이유만으로 인터페이스가 항상 무의미한 것도 아닙니다. 외부 경계를 애플리케이션의 의미 있는 계약으로 표현하거나 독립적인 변경 이유를 분리해야 한다면 구현 개수와 관계없이 가치가 있을 수 있습니다.

추상 클래스 역시 단순 코드 재사용을 위해 만드는 것이 아니라 **실제로 같은 기반 상태와 생명주기를 공유하는 하위 타입 관계인지** 확인해야 합니다.

결국 선택 기준은 문법 기능의 개수가 아니라 설계 관계입니다. **역할과 계약을 여러 타입에 부여하려면 인터페이스를, 하나의 클래스 계층에서 공통 상태와 기반 구현을 공유해야 한다면 추상 클래스를 우선 검토한다**고 이해하면 됩니다.
