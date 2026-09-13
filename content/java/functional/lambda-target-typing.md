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

// use(s -> s.length()); // 두 target이 모두 적용 가능해 모호할 수 있음
```

호출 인자인 lambda는 overload 후보를 검토하는 동안 각 후보의 target type에 맞춰 해석됩니다. 여러 함수형 인터페이스가 같은 lambda body를 받아들일 수 있고 Java의 더 구체적인 메서드 선택 규칙으로 하나를 정하지 못하면 호출은 컴파일되지 않습니다.

이럴 때는 target을 명확히 할 수 있습니다.

```java
Function<String, Integer> length = s -> s.length();
use(length);
```

또는 필요한 경우 명시적인 cast로 어떤 함수형 인터페이스를 의도했는지 표현할 수 있습니다. 다만 overload 자체가 호출자에게 반복적으로 모호함을 만든다면 API 이름이나 시그니처를 분리하는 설계도 검토해야 합니다.

### lambda는 이름 없는 클래스 문법과 완전히 같지 않다

lambda를 설명할 때 “익명 클래스의 축약형”이라고만 말하면 `this`의 의미나 scope 등에서 틀릴 수 있습니다. lambda 본문의 `this`는 lambda를 둘러싼 문맥의 `this`와 관련되고, 익명 클래스는 자신만의 인스턴스를 만듭니다.

### checked exception도 target의 계약 안에서 검사된다

lambda body에서 checked exception을 던질 수 있는지도 target functional interface의 추상 메서드 계약과 연결됩니다.

```java
@FunctionalInterface
interface Loader {
    String load() throws IOException;
}

Loader loader = () -> Files.readString(path);
```

반대로 `Supplier<String>`의 `get()`은 `IOException`을 선언하지 않으므로 같은 body를 그대로 사용할 수 없습니다. lambda라고 해서 checked exception 검사가 사라지는 것이 아니라, **어떤 추상 메서드를 구현하는 것으로 해석되는가**가 검사 기준이 됩니다.

### 문제를 풀 때 target부터 찾는다

lambda 결과를 묻는 문제에서는 lambda 본문부터 분석하지 말고 다음 순서로 봅니다.

1. 어디에 대입되거나 어떤 메서드 인자로 전달되는가?
2. 기대하는 함수형 인터페이스의 추상 메서드는 무엇인가?
3. 매개변수 타입과 반환 타입, `throws` 계약은 무엇인가?
4. lambda 본문이 그 계약을 만족하는가?
5. overload가 있다면 여러 target 중 하나를 고를 수 있는가?

**target type을 먼저 쓰면** 타입 추론 문제의 절반이 정리됩니다.

### target type은 실행 중에 결정되지 않는다

lambda는 이름만 보고 어떤 함수형 인터페이스로도 변하는 값이 아닙니다. 컴파일러가 대입 위치나 메서드 overload를 통해 target type을 정한 뒤 매개변수·반환값·checked exception 계약을 검사합니다. 그래서 같은 `x -> x + 1`도 `Function<Integer, Integer>`와 `UnaryOperator<Integer>`에서는 호환될 수 있지만, target이 없는 `var f = x -> x + 1`은 컴파일할 수 없습니다.

이 구분은 runtime reflection이나 lambda 실행 속도의 문제가 아니라 **소스 타입 추론과 컴파일 경계**의 문제입니다.

### 면접에서 이렇게 나옵니다

#### Q. Java lambda는 자체적으로 타입을 가지나요?

lambda expression은 대입 위치나 메서드 인자처럼 주변 문맥이 제공하는 함수형 인터페이스를 target type으로 사용합니다. 그래서 같은 모양의 lambda도 서로 다른 함수형 인터페이스에 호환될 수 있고, target이 전혀 없는 `var f = x -> x + 1` 같은 선언은 타입을 정할 수 없어 허용되지 않습니다.

#### Q. lambda를 인자로 받는 overload가 여러 개면 왜 모호해질 수 있나요?

각 overload의 함수형 인터페이스가 lambda의 후보 target이 됩니다. 둘 이상이 적용 가능하고 더 구체적인 하나를 선택할 수 없다면 컴파일 오류가 발생합니다. 변수나 cast로 target을 명시할 수 있지만, 반복적으로 모호한 API라면 overload 설계 자체도 검토할 가치가 있습니다.
