---
kind: concept
contentKey: java.core.object-model.inheritance-is-a
topicContentKey: java.core.object-model
slug: inheritance-is-a
title: "상속과 is-a 관계"
summary: "상속을 코드 재사용 수단만으로 보지 않고 의미 있는 하위 타입 관계와 변경 결합도를 기준으로 판단한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.4"
    title: "JLS 8.1.4 Superclasses and Subclasses"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 클래스 상속과 하위 타입 관계의 언어 규칙 확인
---
# 상속과 is-a 관계

상속은 기존 클래스의 코드를 재사용할 수 있게 해 주지만, “중복 코드가 있으니 상속한다”만으로 선택하면 하위 클래스가 상위 클래스의 구현 세부에 강하게 묶일 수 있습니다. 상속을 판단할 때 먼저 봐야 하는 것은 **하위 객체를 상위 타입 객체로 자연스럽게 다룰 수 있는가**입니다.

이를 흔히 **is-a 관계**라고 표현합니다. `Dog is an Animal`처럼 의미적으로 하위 타입이 상위 타입의 계약을 지킬 수 있어야 합니다.

### 상속은 타입 관계도 만든다

```java
class Payment {
    void pay() {}
}

class CardPayment extends Payment {
    @Override
    void pay() {
        // 카드 결제
    }
}

Payment payment = new CardPayment();
payment.pay();
```

`CardPayment` 객체를 `Payment` 타입으로 다룰 수 있고, `Payment`가 약속한 `pay()` 의미를 지킨다면 다형성을 활용할 수 있습니다.

반대로 “코드가 비슷하다”는 이유만으로 의미가 다른 클래스를 상속하면 상위 타입으로 사용했을 때 이상한 동작이 생길 수 있습니다.

### 구현 재사용에는 숨은 비용이 있다

하위 클래스는 상위 클래스의 protected 멤버, 메서드 호출 순서, override 가능한 지점 등에 영향을 받을 수 있습니다. 상위 클래스 내부 구현을 바꿨는데 하위 클래스가 예상하지 못한 방식으로 깨지는 문제를 흔히 **취약한 기반 클래스 문제**라고 부릅니다.

```java
class BaseCounter {
    protected int count;

    void add() {
        count++;
    }
}
```

하위 클래스가 `count`의 구체적인 관리 방식에 의존하면 상위 클래스가 내부 표현을 바꾸기 어려워집니다. 즉 상속은 코드 공유와 함께 **변경 방향도 공유하게 만드는 강한 관계**입니다.

### 행동 계약을 지킬 수 있는지 본다

상속 관계에서는 하위 타입이 상위 타입을 기대하는 코드에 들어가도 계약을 깨지 않아야 합니다. 상위 타입의 메서드를 하위 클래스에서 `UnsupportedOperationException`으로 막아야 한다면 하위 타입 관계가 자연스러운지 다시 볼 필요가 있습니다.

예를 들어 “모든 새는 날 수 있다”라는 추상화에 날지 못하는 새를 억지로 넣으면 하위 클래스가 상위 계약을 지키기 어려워집니다. 문제는 Java 문법이 아니라 타입 모델링에 있습니다.

### 코드 재사용만 필요하면 합성도 검토한다

다른 객체의 기능을 사용하고 싶은 것이 목적이라면 상속 대신 그 객체를 필드로 가지고 협력하는 방법이 있습니다.

```java
class OrderService {
    private final PriceCalculator calculator;
}
```

합성은 구현을 물려받는 대신 필요한 동작을 위임합니다. 그래서 두 객체가 독립적으로 바뀔 여지가 더 큽니다. 물론 항상 합성이 정답이라는 뜻은 아니며, 진짜 하위 타입 관계라면 상속이 자연스럽습니다.

### 판단 기준

상속을 고려할 때 다음 질문을 해 보세요.

- 하위 객체를 상위 타입으로 사용해도 의미가 자연스러운가?
- 상위 타입이 약속한 행동을 하위 타입이 지킬 수 있는가?
- 필요한 것은 타입 다형성인가, 단순 코드 재사용인가?
- 상위 구현 변경이 하위 클래스에 강하게 영향을 주지 않는가?

면접에서도 “상속보다 합성이 좋다”를 외우기보다 **상속은 타입 관계와 구현 결합을 함께 만든다**고 설명하는 편이 정확합니다.
