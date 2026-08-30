---
kind: concept
contentKey: java.core.design-patterns.strategy-pattern
topicContentKey: java.core.design-patterns
slug: strategy-pattern
title: "Strategy 패턴과 알고리즘 교체"
summary: "같은 목적의 변하는 알고리즘을 객체 협력으로 교체 가능하게 설계한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html"
    title: "Comparator API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 알고리즘 정책을 함수 객체로 전달하는 대표 API 확인
  - url: "https://refactoring.guru/design-patterns/strategy"
    title: "Strategy Design Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: context와 교체 가능한 strategy 협력 구조 참고
---
# Strategy 패턴과 알고리즘 교체

## 쉬운 진입

같은 상품을 할인하되 회원 등급별 계산법이 달라진다면 주문 서비스 안에 `if`를 계속 늘리는
대신 할인 정책을 갈아 끼울 수 있다. 호출자는 “할인 계산”만 알고 구체적인 계산법은 몰라도 된다.

## 정확한 메커니즘

Strategy는 공통 목적의 작은 인터페이스와 여러 구현, 이를 사용하는 Context로 구성된다.
Java의 `Comparator`는 정렬 알고리즘에 비교 정책을 전달하는 익숙한 예다.

```text
OrderService ──uses──> DiscountPolicy
                         ├─ MemberDiscount
                         └─ CouponDiscount
```

다형성은 호출 시 실제 객체의 구현을 선택하므로 context의 핵심 흐름은 유지되고 정책만
교체된다. 전략이 하나뿐이거나 변하지 않는 조건이면 단순한 메서드가 더 읽기 좋다.

## 실전·면접 연결

테스트에서는 고정 정책을 주입해 계산 흐름을 검증할 수 있다. Spring을 사용하지 않아도
생성자 매개변수로 strategy를 전달하면 DI가 성립한다. 다만 전략마다 상태와 의존성이 크게
달라지면 인터페이스를 억지로 통합하지 말고 협력 경계를 다시 잡는다.

## 흔한 오해

- Strategy는 모든 `if`를 없애는 규칙이 아니다. 실제로 교체되는 정책 축이 있을 때 쓴다.
- 람다를 썼다고 자동으로 Strategy 설계가 좋아지는 것은 아니다.
- 상속으로 알고리즘을 바꾸는 Template Method와 달리 Strategy는 합성으로 교체한다.
