---
kind: concept
contentKey: java.core.object-model.composition-collaboration
topicContentKey: java.core.object-model
slug: composition-collaboration
title: "합성과 객체 협력"
summary: "행동을 상속으로 고정하기보다 협력 객체에 위임하여 각 책임을 독립적으로 변경할 수 있는 구조를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/tutorial/java/concepts/object.html"
    title: "Oracle Java Tutorials: What Is an Object?"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 객체 상태와 동작, 객체 간 협력의 기본 관점 참고
  - url: "https://tecoble.techcourse.co.kr/post/2020-05-18-inheritance-vs-composition/"
    title: "Tecoble: 상속보다는 조합(Composition)을 사용하자"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: 상속의 구현 결합과 composition으로 책임을 위임하는 사례 비교
---
# 합성과 객체 협력

객체지향 프로그램은 하나의 객체가 모든 일을 처리하는 구조보다 **서로 다른 책임을 가진 객체가 협력하는 구조**로 이해하는 편이 좋습니다. 다른 기능이 필요할 때 그 구현을 상속받는 대신, 필요한 객체를 필드로 가지고 동작을 요청하는 방식을 **합성(composition)** 이라고 합니다.

```java
class OrderService {
    private final DiscountPolicy discountPolicy;

    OrderService(DiscountPolicy discountPolicy) {
        this.discountPolicy = discountPolicy;
    }

    Money calculatePrice(Order order) {
        return discountPolicy.discount(order);
    }
}
```

`OrderService`가 할인 계산 구현을 상속받은 것이 아닙니다. `DiscountPolicy`라는 협력 객체에게 할인 계산을 요청합니다.

```text
OrderService
    │
    │ discount(order)
    ▼
DiscountPolicy
    ▲
 ┌──┴─────────────┐
 │                │
FixedDiscount   RateDiscount
```

## 상속과 합성은 관계의 의미가 다르다

```text
상속                               합성

DiscountBase                       OrderService
     ▲                                  │
     │ extends                            │ has-a / 위임
     │                                  ▼
OrderService                       DiscountPolicy
```

상속에서는 하위 클래스가 상위 타입 계층과 구현 관계에 들어갑니다. 합성에서는 객체의 정체성을 바꾸지 않고 **다른 책임을 가진 객체와 협력**합니다.

이 차이 때문에 필요한 것이 단순한 기능 재사용이나 정책 교체라면 합성이 더 자연스러운 경우가 많습니다. 할인 정책을 정액에서 비율 방식으로 바꾸더라도 `OrderService` 자체를 다른 하위 타입으로 만들 필요 없이 협력 객체를 바꿀 수 있습니다.

```java
DiscountPolicy policy = new RateDiscountPolicy(...);
OrderService service = new OrderService(policy);
```

결합이 사라지는 것은 아닙니다. `OrderService`는 여전히 `DiscountPolicy`라는 계약을 알아야 합니다. 중요한 점은 **구체 구현의 내부 구조가 아니라 협력에 필요한 계약에 의존하도록 결합의 위치를 좁히는 것**입니다.

## 객체를 잘게 나누는 것 자체가 목적은 아니다

합성을 선호한다고 해서 모든 메서드를 별도 클래스로 분리해야 하는 것은 아닙니다. 역할이 불분명한 작은 객체가 지나치게 많으면 오히려 흐름을 따라가기 어려워집니다.

분리할 가치가 큰 경우는 대체로 다음과 같습니다.

- 정책이 독립적인 이유로 변경될 가능성이 크다.
- 여러 구현이 존재하거나 생길 수 있다.
- 외부 시스템 접근처럼 별도 경계를 둘 이유가 있다.
- 한 객체가 서로 다른 변경 이유를 너무 많이 알고 있다.

반대로 짧고 안정적인 내부 계산이며 실제 변경 축도 없다면 별도 인터페이스와 래퍼를 만드는 것이 읽기 비용만 늘릴 수 있습니다.

| 관점 | 상속 | 합성 |
| --- | --- | --- |
| 관계 | is-a 타입 관계 | has-a / 협력 관계 |
| 재사용 | 상위 구현을 물려받음 | 협력 객체의 공개 동작을 호출 |
| 변경 영향 | 상위 구현 변화의 영향을 받기 쉬움 | 계약 뒤 구현을 교체하기 쉬움 |
| 적합한 상황 | 실제 하위 타입 관계 | 책임 분리·정책 교체·협력 |

따라서 “상속보다 합성이 무조건 좋다”를 외우기보다 **타입 관계가 필요한지, 아니면 다른 책임을 가진 객체와 협력하면 되는지**를 먼저 판단해야 합니다.
