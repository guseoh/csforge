---
kind: concept
contentKey: java.core.functional.functional-interface
topicContentKey: java.core.functional
slug: functional-interface
title: "함수형 인터페이스"
summary: "추상 메서드 하나의 계약을 행동 값의 타입으로 사용하고 Predicate, Function, Consumer, Supplier의 역할을 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8"
    title: "JLS 9.8 Functional Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 함수형 인터페이스의 언어 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html"
    title: "Java SE 25 API: java.util.function"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 표준 함수형 인터페이스 확인
---
# 함수형 인터페이스

Java에서 lambda를 변수나 매개변수로 전달하려면 그 lambda가 어떤 입력을 받고 어떤 결과를 내는지 나타내는 타입이 필요합니다. **추상 메서드가 하나인 인터페이스**가 그 역할을 할 수 있고, 이런 인터페이스를 함수형 인터페이스(functional interface)라고 합니다.

```java
@FunctionalInterface
interface DiscountPolicy {
    long discount(long price);
}
```

이제 구현 클래스를 만들지 않고도 lambda로 행동을 전달할 수 있습니다.

```java
DiscountPolicy tenPercent = price -> price * 90 / 100;
long result = tenPercent.discount(10_000);
```

### “메서드가 하나”가 아니라 “추상 메서드가 하나”다

함수형 인터페이스는 default 메서드나 static 메서드를 가질 수 있습니다.

```java
@FunctionalInterface
interface Checker {
    boolean test(String value); // 유일한 abstract method

    default Checker negate() { ... }
    static Checker always() { ... }
}
```

핵심은 lambda가 구현할 **단 하나의 추상 계약(SAM, Single Abstract Method)** 이 있다는 것입니다. `Object`의 public 메서드와 대응되는 선언 등 세부 규칙도 있어 단순히 소스에 메서드가 몇 줄인지 세는 것으로 판단하면 안 됩니다.

### @FunctionalInterface는 무엇을 해 주나

`@FunctionalInterface`를 붙이면 컴파일러가 해당 인터페이스가 함수형 인터페이스 규칙을 지키는지 검사합니다. 애너테이션이 없어도 규칙을 만족하면 lambda target이 될 수 있지만, 붙여 두면 “이 인터페이스는 lambda 사용을 위한 단일 추상 계약을 유지한다”는 의도를 표현할 수 있습니다.

### 표준 인터페이스를 먼저 익혀 두면 좋다

| 타입 | 입력 | 결과 | 대표 용도 |
|---|---|---|---|
| `Predicate<T>` | T | boolean | 조건 검사 |
| `Function<T,R>` | T | R | 값 변환 |
| `Consumer<T>` | T | 없음 | 값을 받아 부수효과 수행 |
| `Supplier<T>` | 없음 | T | 값 생성/지연 제공 |
| `UnaryOperator<T>` | T | T | 같은 타입 변환 |
| `BinaryOperator<T>` | T,T | T | 두 값을 같은 타입 결과로 결합 |

이미 표준 타입으로 의미를 충분히 표현할 수 있다면 별도 `StringChecker`, `ValueMapper` 같은 인터페이스를 매번 만들 필요는 없습니다. 반대로 도메인 의미가 중요한 계약이라면 이름 있는 사용자 인터페이스가 더 읽기 좋을 수 있습니다.

### 문제를 풀 때 확인할 것

lambda 앞에서 막히면 먼저 target functional interface의 추상 메서드를 적어 보세요. 매개변수 타입과 반환 타입이 보이면 lambda 본문이 무엇을 받아 무엇을 반환해야 하는지도 자연스럽게 결정됩니다.
