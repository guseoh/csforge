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
    └─ 실제 할인 규칙 수행
```

할인 정책이 바뀌어도 `OrderService`의 핵심 책임이 그대로라면 다른 `DiscountPolicy` 구현을 연결할 수 있습니다.

### 합성이 변경에 유리한 이유

상속은 컴파일 시점에 상위·하위 클래스 관계가 정해지고 하위 클래스가 상위 구현의 영향을 받습니다. 합성은 객체가 **공개된 계약을 통해 협력**하도록 만들 수 있어 내부 구현 결합을 줄이기 쉽습니다.

예를 들어 할인 정책을 정액 할인에서 비율 할인로 바꾸고 싶다면 새 구현을 만들어 연결할 수 있습니다.

```java
DiscountPolicy policy = new RateDiscountPolicy(...);
OrderService service = new OrderService(policy);
```

이것은 단순히 테스트를 쉽게 만드는 기술이 아니라 **변경 이유가 다른 책임을 별도 객체로 분리하는 방법**입니다.

### 하지만 객체를 잘게 쪼개는 것 자체가 목적은 아니다

합성을 선호한다고 해서 모든 메서드를 별도 클래스로 뽑을 필요는 없습니다. 역할이 명확하지 않은 작은 클래스가 지나치게 많으면 흐름을 따라가기 더 어려울 수 있습니다.

분리할 가치가 큰 경우는 대체로 다음과 같습니다.

- 해당 정책이 독립적으로 변경될 가능성이 높다.
- 여러 구현이 존재하거나 생길 수 있다.
- 외부 시스템 접근처럼 별도 경계가 필요하다.
- 한 객체가 서로 다른 변경 이유를 너무 많이 가지고 있다.

### Spring DI와의 연결

Spring에서는 `OrderService`와 `DiscountPolicy` 같은 객체를 Bean으로 만들고 연결해 줄 수 있습니다. 하지만 핵심 설계는 Spring이 아니라 **어떤 객체가 어떤 책임을 가지고 협력해야 하는가**입니다.

Spring DI를 사용하지 않아도 생성자에서 협력 객체를 전달하는 순수 Java 코드는 충분히 좋은 합성 구조가 될 수 있습니다.

### 상속과 비교하면

| 관점 | 상속 | 합성 |
|---|---|---|
| 관계 | is-a 타입 관계 | has-a / 협력 관계 |
| 재사용 | 상위 구현을 물려받음 | 공개된 동작을 호출 |
| 변경 결합 | 상위 구현의 영향을 받기 쉬움 | 계약 뒤 구현을 교체하기 쉬움 |
| 적합한 상황 | 진짜 하위 타입 관계 | 책임 분리·정책 교체·협력 |

문제에서 “상속과 합성 중 무엇이 무조건 더 좋은가”를 찾기보다 **타입 관계가 필요한지, 아니면 다른 책임의 객체와 협력하면 되는지**를 먼저 판단해야 합니다.
