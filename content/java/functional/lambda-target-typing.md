---
kind: concept
contentKey: java.core.functional.lambda-target-typing
topicContentKey: java.core.functional
slug: lambda-target-typing
title: "Lambda의 target type"
summary: "lambda 표현식의 매개변수와 반환 의미가 주변 함수형 인터페이스 문맥에서 결정되는 target typing을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27"
    title: "JLS 15.27 Lambda Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: lambda와 target typing 규칙 확인
---
# Lambda의 target type

다음 lambda만 따로 보면 `x`가 어떤 타입이고 전체 lambda가 어떤 Java 타입인지 알 수 없습니다.

```java
x -> x.length()
```

Java의 lambda는 주변 문맥이 기대하는 **함수형 인터페이스 타입(target type)** 을 통해 의미가 정해집니다.

```java
Function<String, Integer> length = x -> x.length();
```

여기서는 target이 `Function<String, Integer>`이므로 `x`는 `String`이고 반환 결과는 `Integer`와 맞아야 합니다.

### 같은 모양의 lambda가 다른 타입이 될 수 있다

```java
Predicate<String> notEmpty = x -> !x.isEmpty();
Predicate<List<?>> hasValues = x -> !x.isEmpty();
```

lambda 문법 자체보다 대입되는 인터페이스가 매개변수 타입과 반환 계약을 결정합니다.

메서드 호출 인자에서도 target type이 생깁니다.

```java
stream.filter(x -> x.active());
```

`filter`가 `Predicate<? super T>`를 기대하기 때문에 lambda가 Predicate 역할로 해석됩니다.

### overload와 만나면 모호해질 수 있다

```java
void use(Function<String, Integer> f) { }
void use(ToIntFunction<String> f) { }

// use(s -> s.length()); // 문맥에 따라 overload가 모호할 수 있음
```

두 함수형 인터페이스가 같은 lambda 형태를 받아들일 수 있으면 컴파일러가 어느 overload를 선택해야 할지 결정하지 못할 수 있습니다. cast나 메서드 이름 분리로 의도를 명시해야 할 수 있습니다.

### lambda는 이름 없는 클래스 문법과 완전히 같지 않다

lambda를 설명할 때 “익명 클래스의 축약형”이라고만 말하면 `this`의 의미나 scope 등에서 틀릴 수 있습니다. lambda 본문의 `this`는 lambda를 둘러싼 문맥의 `this`와 관련되고, 익명 클래스는 자신만의 인스턴스를 만듭니다.

### 문제를 풀 때 target부터 찾는다

lambda 결과를 묻는 문제에서는 lambda 본문부터 분석하지 말고 다음 순서로 봅니다.

1. 어디에 대입되거나 어떤 메서드 인자로 전달되는가?
2. 기대하는 함수형 인터페이스의 추상 메서드는 무엇인가?
3. 매개변수 타입과 반환 타입은 무엇인가?
4. lambda 본문이 그 계약을 만족하는가?

**target type을 먼저 쓰면** 타입 추론 문제의 절반이 정리됩니다.
