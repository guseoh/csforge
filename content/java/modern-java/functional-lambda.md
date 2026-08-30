---
kind: concept
contentKey: java.core.modern-java.functional-lambda
topicContentKey: java.core.modern-java
slug: functional-lambda
title: 함수형 인터페이스와 람다
summary: 단일 추상 메서드 계약과 람다의 타입 추론을 활용해 동작을 전달한다
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 함수형 인터페이스의 언어 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html"
    title: java.util.function API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 표준 함수형 인터페이스 종류 확인
---
# 함수형 인터페이스와 람다

함수형 인터페이스(functional interface)는 추상 메서드가 하나인 인터페이스입니다. `@FunctionalInterface`는 이 의도를 컴파일러가 확인하게 하는 선택적 어노테이션입니다. 람다는 이 계약을 구현하는 동작을 간결하게 표현하며, 람다 자체는 독립적인 익명 함수 타입이라기보다 목표 타입(target type)을 통해 인터페이스 값으로 해석됩니다.

```java
Predicate<String> nonBlank = value -> value != null && !value.isBlank();
```

람다가 캡처하는 지역 변수는 effectively final이어야 합니다. 람다를 짧게 만드는 것과 상태를 숨기는 것은 별개이므로, 외부 mutable 상태를 캡처해 실행 순서에 의존하게 만들면 읽기와 테스트가 어려워질 수 있습니다.

`Function`, `Predicate`, `Consumer`, `Supplier` 같은 표준 타입은 단순한 동작 전달에 유용합니다. 도메인 의미가 강하거나 인자가 복잡해지면 이름 있는 인터페이스가 람다보다 계약을 더 잘 설명할 수 있습니다.
