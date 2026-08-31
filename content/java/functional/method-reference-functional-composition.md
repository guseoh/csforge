---
kind: concept
contentKey: java.core.functional.method-reference-functional-composition
topicContentKey: java.core.functional
slug: method-reference-functional-composition
title: "메서드 참조와 함수 조합"
summary: "이미 존재하는 메서드를 lambda 대신 메서드 참조로 표현하고 Predicate·Function 조합을 읽기 쉽게 사용할 기준을 익힌다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.13"
    title: "JLS 15.13 Method Reference Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 메서드 참조 표현식 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/Predicate.html"
    title: "Java SE 25 API: Predicate"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: and/or/negate 조합 API 확인
---
# 메서드 참조와 함수 조합

lambda가 단순히 이미 존재하는 메서드를 호출하기만 한다면 **메서드 참조(method reference)** 로 더 간결하게 표현할 수 있습니다.

```java
names.stream()
     .map(name -> name.trim());
```

다음처럼 쓸 수 있습니다.

```java
names.stream()
     .map(String::trim);
```

두 문법의 목적은 새로운 동작을 만드는 것이 아니라 **같은 함수형 인터페이스 계약에 기존 메서드를 연결**하는 것입니다.

### 메서드 참조도 target type이 필요하다

```java
Function<String, Integer> length = String::length;
```

`String::length`만 보고 독립적인 함수 객체 타입이 결정되는 것이 아니라 `Function<String, Integer>`라는 문맥이 있어야 매개변수와 반환 연결이 정해집니다.

대표 형태는 다음과 같습니다.

```java
String::trim           // 특정 타입의 instance method
System.out::println    // 특정 객체의 instance method
Integer::parseInt      // static method
ArrayList::new         // constructor reference
```

### Predicate는 작은 조건을 조합할 수 있다

```java
Predicate<Order> paid = order -> order.status() == PAID;
Predicate<Order> expensive = order -> order.totalPrice() >= 100_000;

Predicate<Order> target = paid.and(expensive);
```

`and`, `or`, `negate`를 사용하면 조건의 의미를 이름 붙여 조합할 수 있습니다.

### Function도 앞뒤 변환을 연결할 수 있다

```java
Function<String, String> trim = String::trim;
Function<String, Integer> parse = Integer::parseInt;

Function<String, Integer> trimAndParse = trim.andThen(parse);
```

입력과 출력 타입이 이어질 수 있어야 조합이 가능합니다.

### 간결함보다 읽기 쉬운지가 우선이다

```java
process(this::a);
```

`a`라는 메서드 이름이 의미가 없으면 lambda보다 짧아도 이해하기 어렵습니다. 반대로 `Order::totalPrice`, `Member::email`처럼 역할이 분명한 메서드 참조는 pipeline을 읽기 쉽게 할 수 있습니다.

또 복잡한 lambda를 무리하게 메서드 참조 형태로 바꾸려고 할 필요는 없습니다. **동작의 의도가 더 잘 보이는 표현을 선택**하는 것이 핵심입니다.
