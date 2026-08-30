---
kind: concept
contentKey: java.core.object-model.composition-collaboration
topicContentKey: java.core.object-model
slug: composition-collaboration
title: "Composition과 collaboration"
summary: "변경 가능한 행동을 상속보다 객체 협력으로 분리하는 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: field와 class 구성의 언어 기반 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: collaborator contract를 interface로 표현하는 규칙 확인
---
# Composition과 collaboration

## 쉬운 진입

커피머신이 히터의 내부 부품을 상속받는 것보다, 히터를 “가지고” 필요할 때 켜는 편이 부품을
교체하기 쉽다. 객체의 행동을 다른 객체와 협력해 조립하는 것이 composition이다. 상속은 강한
is-a 계약을 만들지만 composition은 has-a 관계와 위임을 만든다.

## 정확한 메커니즘

```java
interface DiscountPolicy {
    Money discount(Order order);
}

final class Checkout {
    private final DiscountPolicy policy;

    Checkout(DiscountPolicy policy) {
        this.policy = policy;
    }

    Money total(Order order) {
        return order.price().subtract(policy.discount(order));
    }
}
```

`Checkout`은 정책 구현을 상속하지 않고 collaborator에게 책임을 위임한다. 생성자에 정책을
받으면 운영 구현과 테스트용 fake를 바꿀 수 있고, 정책 변경이 Checkout의 부모 계층을 흔들지
않는다. 대신 객체가 많아지고 위임 경계를 설계해야 하므로 작은 일에도 무조건 조립 계층을 늘리지는 않는다.

```text
Checkout ──has-a──> DiscountPolicy
     ├─ production policy
     └─ test fake policy
```

## 실전·면접 연결

변동하는 계산·외부 연동·권한 정책을 composition으로 분리하면 변경 이유가 한 class에 몰리지
않는다. 반대로 안정적인 subtype 계약과 공통 구현이 실제로 있고 대체 가능성이 유지된다면
상속이 더 단순할 수 있다. 판단 기준은 “재사용” 하나가 아니라 결합도와 책임의 변화 방향이다.

## 흔한 오해

- composition은 단순히 field를 하나 추가하는 문법이 아니라 책임을 collaborator에 위임하는 설계다.
- 상속보다 항상 우월한 규칙은 없다.
- DI container 없이도 constructor로 collaborator를 전달하는 순수 Java 설계가 가능하다.
