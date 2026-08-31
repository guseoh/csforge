---
kind: concept
contentKey: java.core.design-patterns.factory-pattern
topicContentKey: java.core.design-patterns
slug: factory-pattern
title: "Factory와 객체 생성 책임"
summary: "구현 선택이나 복잡한 생성 규칙을 사용하는 코드에서 분리해 한 생성 경계로 모으고 불필요한 Factory를 구분한다"
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

객체를 사용하는 코드가 구체 구현 선택과 생성 인자 구성까지 모두 담당하면 비즈니스 흐름과 생성 정책이 섞일 수 있습니다.

```java
if (type == CARD) {
    processor = new CardProcessor(config.cardUrl(), ...);
} else {
    processor = new BankProcessor(config.bankUrl(), ...);
}
```

이 선택이 여러 곳에 반복되거나 생성 절차가 복잡하다면 **객체를 만드는 책임을 별도 경계에 모으는 Factory**를 고려할 수 있습니다.

```java
class PaymentProcessorFactory {
    PaymentProcessor create(PaymentType type) {
        return switch (type) {
            case CARD -> new CardProcessor(...);
            case BANK -> new BankProcessor(...);
        };
    }
}
```

사용하는 쪽은 어떤 구체 클래스를 `new`해야 하는지 몰라도 됩니다.

### Factory가 숨길 수 있는 것

Factory는 단순히 `new` 한 줄을 다른 파일로 옮기는 것이 아니라 다음과 같은 **생성 정책**을 숨길 때 가치가 큽니다.

- 입력에 따른 구현 클래스 선택
- 여러 의존성을 조합하는 복잡한 생성
- 객체 재사용 여부
- 생성 전에 필요한 검증이나 설정 해석

### 정적 팩터리와 이름이 비슷하지만 관점이 다르다

`Money.of(1000)` 같은 정적 팩터리는 보통 클래스 자신이 제공하는 생성 API입니다. Factory 객체는 여러 구현 생성이나 생성 정책 자체를 별도 책임으로 분리하는 경우가 많습니다.

둘을 엄격히 이름만으로 분류하기보다 **생성 책임이 어디에 있고 호출자가 어떤 세부에서 분리되는지**를 보면 됩니다.

### 불필요한 Factory는 피한다

```java
class MemberFactory {
    Member create(String name) {
        return new Member(name);
    }
}
```

생성 규칙도 없고 구현 선택도 없는데 이런 클래스가 하나 더 생기면 단순한 `new Member(name)`보다 얻는 것이 없을 수 있습니다.

Factory는 패턴을 적용했다는 사실보다 **객체 생성의 변화 이유가 실제 사용 로직과 분리될 필요가 있는가**를 기준으로 선택합니다.
