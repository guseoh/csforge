---
kind: concept
contentKey: java.core.object-model.abstraction-responsibility
topicContentKey: java.core.object-model
slug: abstraction-responsibility
title: "Abstraction과 responsibility"
summary: "구현 세부가 아니라 객체의 책임과 계약을 중심으로 추상화한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class member와 구현 구조의 언어 기반 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: interface contract와 abstract method 규칙 확인
  - url: "https://techblog.woowahan.com/2644/"
    title: "우아한형제들 기술블로그: 병아리 개발자의 걸음마 한 발짝"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: 객체 책임과 객체지향 코드리뷰 사례 보충
---
# Abstraction과 responsibility

## 쉬운 진입

택시를 부를 때 승객은 엔진의 연료 분사 순서를 알 필요 없이 “목적지까지 이동한다”는 계약을
사용한다. Java 객체의 abstraction도 내부 단계 전체를 숨기고, 협력자가 믿고 사용할 책임과
결과를 드러내는 일이다.

## 정확한 메커니즘

```java
interface PriceCalculator {
    Money calculate(Order order);
}

final class Checkout {
    private final PriceCalculator calculator;

    Checkout(PriceCalculator calculator) {
        this.calculator = calculator;
    }

    Receipt pay(Order order) {
        Money price = calculator.calculate(order);
        return new Receipt(price);
    }
}
```

`Checkout`은 가격 계산의 구체적인 분기나 저장 방식을 알지 않고 `PriceCalculator`의 결과 계약에
의존한다. 좋은 abstraction은 모든 구현 세부를 감추는 추상적인 이름이 아니라, 변경 가능성이
있는 책임을 적절한 경계로 묶고 필요한 전제·결과·실패를 분명히 하는 계약이다. 추상화가 너무
작으면 호출자가 세부를 조합하고, 너무 크면 책임이 섞인다.

## 실전·면접 연결

interface를 먼저 만든다는 형식보다 “어떤 협력자의 변화가 이 객체를 흔드는가”를 먼저 찾는다.
Spring의 Bean 계약이나 DI container는 이후 framework 학습이지만, 명시적 생성자 의존성이라는
Java 설계 원칙은 그대로 연결된다.

## 흔한 오해

- interface 이름을 추가했다고 책임이 자동으로 분리되지 않는다.
- abstraction은 구현을 영원히 바꾸지 않는다는 약속이 아니라 필요한 계약을 고정하는 경계다.
- 추상화의 개수가 많을수록 설계가 좋은 것은 아니다.
