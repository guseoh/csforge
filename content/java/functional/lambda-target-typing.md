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

다음 lambda만 따로 보면 `x`가 어떤 타입이고 전체 표현식이 어떤 Java 타입인지 알 수 없습니다.

```java
x -> x.length()
```

Java의 lambda는 주변 문맥이 기대하는 **함수형 인터페이스 타입(target type)** 을 통해 의미가 정해집니다.

```java
Function<String, Integer> length = x -> x.length();
```

여기서는 target이 `Function<String, Integer>`이므로 `x`는 `String`으로 해석되고 반환 결과는 `Integer`와 호환되어야 합니다.

### 같은 모양의 lambda도 문맥에 따라 다른 target을 가질 수 있다

```java
Predicate<String> notEmpty = x -> !x.isEmpty();
Predicate<List<?>> hasValues = x -> !x.isEmpty();
```

lambda 문법 자체에 매개변수 타입이 고정되어 있는 것이 아니라 대입되는 함수형 인터페이스의 추상 메서드 계약이 타입을 제공합니다.

메서드 호출 인자에서도 같은 원리가 적용됩니다.

```java
stream.filter(x -> x.active());
```

`filter`가 `Predicate<? super T>`를 기대하기 때문에 lambda는 그 Predicate 계약에 맞춰 검사됩니다.

### overload와 만나면 여러 target 후보가 생길 수 있다

```java
void use(Function<String, Integer> f) { }
void use(ToIntFunction<String> f) { }

// use(s -> s.length()); // 모호할 수 있음
```

두 함수형 인터페이스가 모두 lambda body와 호환되고 더 구체적인 하나를 선택할 수 없다면 컴파일 오류가 날 수 있습니다. 이때 변수나 명시적인 cast로 target을 분명히 할 수 있습니다.

```java
Function<String, Integer> length = s -> s.length();
use(length);
```

하지만 호출부마다 cast가 반복된다면 overload 설계 자체가 지나치게 비슷한 함수형 계약을 노출하는 것은 아닌지도 검토할 수 있습니다.

### checked exception도 target의 추상 메서드 계약을 따른다

```java
@FunctionalInterface
interface Loader {
    String load() throws IOException;
}

Loader loader = () -> Files.readString(path);
```

`Loader.load()`가 `IOException`을 선언하므로 위 lambda body가 허용될 수 있습니다. 반면 `Supplier<String>`의 `get()`은 같은 checked exception을 선언하지 않기 때문에 그대로 사용할 수 없습니다.

lambda라고 해서 checked exception 검사가 사라지는 것이 아니라 **어떤 추상 메서드를 구현하는 것으로 해석되는가**가 검사 기준입니다.

### lambda와 익명 클래스는 동일한 문법 설탕이 아니다

lambda를 익명 클래스의 축약형으로만 설명하면 `this`와 scope에서 오해가 생길 수 있습니다. 익명 클래스는 자신만의 인스턴스 문맥을 가지지만 lambda의 `this`는 둘러싼 문맥과 연결됩니다.

### target은 런타임에 나중에 정해지는 것이 아니다

```java
// var f = x -> x + 1; // target type이 없어 허용되지 않음
```

lambda는 실행 중에 임의의 함수형 인터페이스로 변하는 값이 아닙니다. 컴파일러가 대입 위치나 메서드 인자 문맥에서 target type을 결정하고 그 추상 메서드에 맞춰 매개변수·반환값·checked exception을 검사합니다.

따라서 lambda 코드를 읽을 때는 본문보다 먼저 **어디에 대입되거나 전달되는지**, 그리고 그 위치가 기대하는 함수형 인터페이스의 추상 메서드가 무엇인지를 확인하는 것이 가장 빠릅니다.
