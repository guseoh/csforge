---
kind: concept
contentKey: java.core.functional.lambda-target-typing
topicContentKey: java.core.functional
slug: lambda-target-typing
title: "Lambda target typing"
summary: "lambda의 타입이 target functional interface 문맥에서 결정되는 방식을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: lambda expression과 target type 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: functional interface 추상 메서드 확인
---
# Lambda target typing

## 쉬운 진입

`x -> x + 1`만 보면 x의 타입을 알 수 없다. 이 식을 `Function<Integer, Integer>` 자리에
놓는지, `IntUnaryOperator` 자리에 놓는지에 따라 매개변수와 결과의 계약이 달라진다. lambda는
독립적인 class type을 먼저 갖는 값이 아니라 target 문맥에서 해석된다.

## 정확한 메커니즘

```java
Function<String, Integer> length = text -> text.length();
Predicate<String> nonEmpty = text -> !text.isEmpty();
```

overload에 여러 함수형 인터페이스가 후보면 target이 하나로 결정되지 않아 모호할 수 있다.
그럴 때 명시적 cast나 변수 선언으로 의도를 드러낸다. lambda의 매개변수 타입 추론은 target
interface의 함수형 메서드 signature를 사용한다.

## 실전·면접 연결

`Predicate<String>`과 `Function<String, Boolean>`은 결과 모양이 비슷해 보여도 서로 다른
타입이다. overload API에 함수형 인터페이스를 여러 개 만들면 lambda 호출이 모호해질 수
있으므로 이름 있는 변수나 method reference의 target을 설계에 반영한다.

## 흔한 오해

- lambda 자체의 runtime class 이름을 source에서 직접 선언하는 방식이 아니다.
- `var f = x -> x + 1;`처럼 target 없는 local inference는 허용되지 않는다.
- target type이 정해져도 checked exception 규칙은 함수형 메서드 계약을 따른다.
