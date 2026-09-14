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
  - url: "https://tecoble.techcourse.co.kr/post/2020-05-18-inheritance-vs-composition/"
    title: "Tecoble: 상속보다는 조합(Composition)을 사용하자"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: 코드 재사용만을 위한 상속이 구현 결합을 키우는 사례와 composition 대안을 함께 복습
---
# 상속과 is-a 관계

상속은 기존 클래스의 구현을 재사용할 수 있게 해 주지만, 그것만 보고 선택하면 하위 클래스가 상위 클래스의 구현 세부에 강하게 묶일 수 있습니다. 먼저 확인할 것은 **하위 객체를 상위 타입 객체로 자연스럽게 다룰 수 있는가**입니다.

이를 흔히 **is-a 관계**라고 표현합니다. 다만 문장으로 “A는 B다”라고 말할 수 있는지만 보는 것이 아니라, 프로그램에서 하위 타입이 상위 타입의 계약을 지킬 수 있는지도 함께 봐야 합니다.

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

`CardPayment`를 `Payment` 타입으로 사용해도 `Payment`가 약속한 `pay()`의 의미를 지킬 수 있다면 다형성을 활용할 수 있습니다.

## 상속은 코드 공유와 타입 관계를 함께 만든다

상속의 비용은 하위 클래스가 상위 클래스의 `protected` 상태, 메서드 호출 순서, override 가능한 지점 같은 구현 세부에 영향을 받을 수 있다는 데 있습니다. 상위 클래스 내부 구현을 바꿨는데 하위 클래스가 예상하지 못하게 깨지는 문제를 흔히 **취약한 기반 클래스 문제**라고 부릅니다.

```text
의미 있는 하위 타입
CardPayment ──is-a──▶ Payment
                       ▲
                       │ Payment 계약으로 사용

단순 기능 재사용
Report ──?──▶ FileUtil
          └─ 타입 관계가 자연스럽지 않다면
             상속보다 협력을 먼저 검토
```

즉 상속은 코드를 가져오는 기능인 동시에 **변경 방향을 어느 정도 함께 가져가는 강한 관계**입니다.

## 하위 타입은 상위 타입의 행동 계약을 지켜야 한다

상위 타입을 기대하는 코드에 하위 객체를 넣었을 때 의미가 깨진다면 타입 모델을 다시 볼 필요가 있습니다. 상위 타입의 핵심 메서드를 하위 클래스에서 계속 `UnsupportedOperationException`으로 막아야 하는 구조가 대표적인 신호입니다.

문제는 Java 문법이 아니라 모델링에 있습니다. 상위 타입이 약속한 동작과 조건을 하위 타입도 지킬 수 있어야 실제로 대체 가능한 하위 타입이 됩니다.

## 필요한 것이 기능 재사용뿐이면 합성을 검토한다

다른 객체의 기능을 사용하고 싶은 것이 목적이라면 상속 대신 그 객체를 필드로 두고 동작을 요청할 수 있습니다.

```java
class OrderService {
    private final PriceCalculator calculator;
}
```

이 방식은 `OrderService`를 `PriceCalculator`의 하위 타입으로 만들지 않습니다. 두 책임을 독립적인 객체로 유지한 채 협력하게 합니다.

상속과 합성 중 어느 하나가 항상 정답은 아닙니다. 상속을 고려할 때는 **진짜 하위 타입 관계가 필요한지, 상위 계약을 지킬 수 있는지, 아니면 단순히 다른 객체의 기능이 필요한 것인지**를 구분하는 것이 핵심입니다.
