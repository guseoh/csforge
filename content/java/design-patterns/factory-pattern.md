---
kind: concept
contentKey: java.core.design-patterns.factory-pattern
topicContentKey: java.core.design-patterns
slug: factory-pattern
title: "Factory와 객체 생성 책임"
summary: "구체 구현 선택뿐 아니라 dependency 조립·검증·재사용 여부 같은 생성 정책과 객체 수명을 한 경계에 모으고, 사용 책임과 생성 책임을 분리한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9"
    title: "JLS 15.9 Class Instance Creation Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 객체 생성 표현식의 언어 규칙 확인
---
# Factory와 객체 생성 책임

객체를 사용하는 코드가 구체 구현 선택과 생성 방법까지 모두 알면 **사용 책임과 생성 책임이 섞일 수 있습니다.**

```java
PaymentProcessor processor;

if (type == CARD) {
    processor = new CardProcessor(config.cardUrl(), new CardSigner(...));
} else {
    processor = new BankProcessor(config.bankUrl(), new BankAuthenticator(...));
}

processor.pay(order);
```

실제 유스케이스가 관심 있는 것은 `processor.pay(order)`입니다. 어떤 구현을 고르고 어떤 의존성으로 조립할지는 별도의 변화 이유를 가질 수 있습니다.

```java
final class PaymentProcessorFactory {
    private final PaymentConfig config;

    PaymentProcessorFactory(PaymentConfig config) {
        this.config = config;
    }

    PaymentProcessor create(PaymentType type) {
        return switch (type) {
            case CARD -> new CardProcessor(
                    config.cardUrl(),
                    new CardSigner(config.cardKey())
            );
            case BANK -> new BankProcessor(
                    config.bankUrl(),
                    new BankAuthenticator(config.bankKey())
            );
        };
    }
}
```

```text
사용하는 코드
   │ PaymentProcessor 역할만 사용
   ▼

Factory
   ├─ 구체 구현 선택
   ├─ 필요한 객체 조립
   └─ 생성 정책 결정
```

Factory의 핵심은 `new`를 다른 파일로 옮기는 것이 아니라 **생성에 관한 결정이 실제 사용 코드와 독립적으로 바뀔 때 그 결정을 한 경계에 모으는 것**입니다.

## 구현 선택과 조립이 반복될 때 가치가 커진다

짧은 `switch` 하나가 한곳에만 있다면 별도 Factory가 오히려 간접 구조를 늘릴 수 있습니다. 반대로 여러 호출자가 같은 구현 선택과 의존성 조립을 반복한다면 Factory가 그 지식을 한곳에 모을 수 있습니다.

Factory가 반환 타입을 공통 계약으로 두면 사용하는 코드는 구체 구현 이름을 몰라도 됩니다.

```java
PaymentProcessor create(PaymentType type)
```

다만 호출자가 실제로 구현별 고유 기능을 필요로 하는데 모든 차이를 억지로 숨기면 결국 `instanceof`와 cast가 다시 나타날 수 있습니다. Factory도 **호출자가 실제로 필요한 계약**을 기준으로 설계해야 합니다.

## 생성 정책에는 객체 수명도 포함될 수 있다

Factory는 항상 새 객체를 만드는 패턴이 아닙니다. 공유해도 안전한 불변·무상태 객체는 재사용할 수 있고, 요청마다 독립 상태를 가져야 하는 객체는 매번 새로 만들어야 할 수 있습니다.

```text
공유해도 의미가 같은 객체   → 재사용 가능성 검토
호출마다 독립 가변 상태 필요 → 별도 인스턴스가 자연스러움
```

중요한 것은 생성 횟수를 줄이는 것이 아니라 **어떤 상태가 누구에게 속하는지에 맞춰 객체 수명을 결정하는 것**입니다.

## 정적 팩터리와 별도 Factory는 책임 범위가 다르다

```java
Money.won(10_000)
```

정적 팩터리는 보통 한 타입이 자신의 생성 의미를 제공하는 API입니다.

```java
PaymentProcessorFactory.create(type)
```

별도 Factory는 여러 구현과 설정·의존성을 선택하고 조립하는 생성 정책이 독립적인 책임일 때 자연스럽습니다.

Builder 역시 다른 문제를 풉니다. Builder는 한 객체의 선택 인자가 많고 구성 단계가 복잡한 문제에 강하고, Factory는 **어떤 구현이나 객체 그래프를 만들지 선택·조립하는 문제**에 강합니다.

아무 생성 정책도 없이 `new Member(name)`을 `MemberFactory.create(name)`로 한 번 감싸는 것이라면 얻는 이점이 거의 없을 수 있습니다. Factory는 패턴을 적용하기 위해 만드는 것이 아니라 **생성 지식이 실제 사용 책임과 분리될 가치가 있을 때** 사용하는 경계입니다.
