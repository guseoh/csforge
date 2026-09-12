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

객체지향 프로그램은 하나의 거대한 객체가 모든 일을 하는 구조보다 **서로 다른 책임을 가진 객체가 메시지를 주고받으며 협력하는 구조**로 이해하는 편이 좋습니다. 다른 기능이 필요할 때 그 구현을 상속받는 대신, 필요한 객체를 필드로 가지고 동작을 요청하는 방식을 **합성(composition)** 이라고 합니다.

### 구현을 물려받는 대신 일을 맡긴다

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

`OrderService`가 할인 계산 알고리즘을 상속받은 것이 아닙니다. `DiscountPolicy`라는 협력 객체에게 계산을 요청합니다.

```text
OrderService
    │
    │ discount(order)
    ▼
DiscountPolicy
    │
    ├─ FixedDiscountPolicy
    └─ RateDiscountPolicy
```

구조를 상속과 나란히 놓으면 차이가 더 잘 보입니다.

```text
상속                                      합성

      DiscountBase                       OrderService
           ▲                                  │
           │ extends                            │ has-a / delegates
           │                                  ▼
      OrderService                       DiscountPolicy
                                               ▲
                                      ┌────────┴────────┐
                                      │                 │
                                   Fixed             Rate
```

상속에서는 `OrderService` 자체가 상위 구현과 타입 계층에 들어갑니다. 합성에서는 `OrderService`의 정체성을 바꾸지 않고 **할인이라는 다른 책임을 협력 객체에 맡깁니다.**

### 합성이 변경에 유리한 이유

상속은 컴파일 시점에 상위·하위 클래스 관계가 정해지고 하위 클래스가 상위 구현의 영향을 받습니다. 합성은 객체가 **공개된 계약을 통해 협력**하도록 만들 수 있어 내부 구현 결합을 줄이기 쉽습니다.

예를 들어 할인 정책을 정액 할인에서 비율 할인로 바꾸고 싶다면 새 구현을 만들어 연결할 수 있습니다.

```java
DiscountPolicy policy = new RateDiscountPolicy(...);
OrderService service = new OrderService(policy);
```

이것은 단순히 테스트를 쉽게 만드는 기술이 아니라 **변경 이유가 다른 책임을 별도 객체로 분리하는 방법**입니다.

다만 결합이 사라지는 것은 아닙니다. `OrderService`는 여전히 `DiscountPolicy` 계약에 의존합니다. 중요한 차이는 구체 구현의 필드나 호출 순서가 아니라 **필요한 협력 계약에 의존하도록 결합의 위치를 좁힌다**는 점입니다.

### 하지만 객체를 잘게 쪼개는 것 자체가 목적은 아니다

합성을 선호한다고 해서 모든 메서드를 별도 클래스로 뽑을 필요는 없습니다. 역할이 명확하지 않은 작은 클래스가 지나치게 많으면 흐름을 따라가기 더 어려울 수 있습니다.

분리할 가치가 큰 경우는 대체로 다음과 같습니다.

- 해당 정책이 독립적으로 변경될 가능성이 높다.
- 여러 구현이 존재하거나 생길 수 있다.
- 외부 시스템 접근처럼 별도 경계가 필요하다.
- 한 객체가 서로 다른 변경 이유를 너무 많이 가지고 있다.

반대로 짧고 안정적인 내부 계산 하나에 실제 변경 축도 대체 구현도 없다면 interface와 wrapper를 여러 겹 만드는 것이 오히려 읽기 비용만 늘릴 수 있습니다.

### Spring DI와의 연결

Spring에서는 `OrderService`와 `DiscountPolicy` 같은 객체를 Bean으로 만들고 연결해 줄 수 있습니다. 하지만 핵심 설계는 Spring이 아니라 **어떤 객체가 어떤 책임을 가지고 협력해야 하는가**입니다.

Spring DI를 사용하지 않아도 생성자에서 협력 객체를 전달하는 순수 Java 코드는 충분히 좋은 합성 구조가 될 수 있습니다.

### 상속과 비교하면

| 관점 | 상속 | 합성 |
| --- | --- | --- |
| 관계 | is-a 타입 관계 | has-a / 협력 관계 |
| 재사용 | 상위 구현을 물려받음 | 공개된 동작을 호출 |
| 변경 결합 | 상위 구현의 영향을 받기 쉬움 | 계약 뒤 구현을 교체하기 쉬움 |
| 적합한 상황 | 진짜 하위 타입 관계 | 책임 분리·정책 교체·협력 |

문제에서 “상속과 합성 중 무엇이 무조건 더 좋은가”를 찾기보다 **타입 관계가 필요한지, 아니면 다른 책임의 객체와 협력하면 되는지**를 먼저 판단해야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. 상속보다 합성을 선호하라는 말은 무슨 뜻인가요?

상속은 코드 재사용뿐 아니라 **is-a 타입 관계와 상위 구현에 대한 결합**까지 함께 만듭니다. 단지 다른 객체의 기능이 필요할 뿐이라면 그 객체를 협력자로 두고 공개 계약을 통해 위임하는 합성이 변경 영향을 줄이기 쉽습니다.

하지만 상속이 항상 나쁘다는 뜻은 아닙니다. 실제로 대체 가능한 subtype 관계이고 상위 계약을 하위 타입이 자연스럽게 지킬 수 있다면 상속이 맞을 수 있습니다.

#### Q. 생성자 주입과 composition은 같은 개념인가요?

같은 말은 아닙니다. composition은 한 객체가 다른 객체를 구성 요소나 협력자로 사용한다는 **객체 구조와 설계 관계**이고, 생성자 주입은 그 협력자를 외부에서 전달하는 한 가지 방법입니다.

Spring은 이런 객체 연결을 자동화할 수 있지만, 어떤 책임을 별도 협력자로 나눌지는 Java 객체 설계에서 먼저 결정해야 합니다.
