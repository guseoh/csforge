---
kind: concept
contentKey: java.core.language-types.numeric-conversion-overflow
topicContentKey: java.core.language-types
slug: numeric-conversion-overflow
title: "숫자 변환과 overflow"
summary: "숫자 타입의 넓히기·좁히기 변환과 연산 시 타입 승격, 정수 범위를 넘을 때의 결과를 코드로 추적한다"
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html"
    title: "JLS 5 Conversions and Contexts"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: widening, narrowing, boxing 등 변환 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.2"
    title: "JLS 4.2.2 Integer Operations"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 정수 연산과 overflow 규칙 확인
---
# 숫자 변환과 overflow

Java 숫자 코드는 단순히 값만 보면 안 되고 **연산이 어떤 타입으로 수행되는지**까지 봐야 합니다. 작은 타입을 큰 타입에 넣을 때는 대부분 자연스럽게 변환되지만, 큰 타입을 작은 타입으로 줄이면 정보가 사라질 수 있습니다. 또한 정수 계산 결과가 타입이 표현할 수 있는 범위를 넘어가도 자동으로 예외가 발생하지 않습니다.

### 더 넓은 타입으로 옮길 때

```java
int count = 100;
long total = count;
```

`int` 값은 모든 가능한 `int` 값을 표현할 수 있는 `long`으로 변환될 수 있습니다. 이런 변환을 **넓히기 변환(widening conversion)** 이라고 합니다. 일반적으로 별도 형변환 표기를 요구하지 않습니다.

하지만 `long`을 `int`로 옮길 때는 값의 일부가 사라질 수 있으므로 명시적인 형변환이 필요합니다.

```java
long total = 3_000_000_000L;
int count = (int) total;
```

이 코드는 컴파일되지만 `count`가 `3_000_000_000`이 되는 것은 아닙니다. 좁은 타입이 표현할 수 없는 상위 비트가 버려지면서 다른 값이 됩니다. 따라서 `(int)`를 적었다는 사실은 “안전하다”는 뜻이 아니라 **개발자가 정보 손실 가능성을 알고 변환을 요청했다**는 뜻에 가깝습니다.

### `byte + byte`가 왜 `int`가 될까

Java의 정수 산술에서는 `byte`, `short`, `char`가 많은 연산에서 `int`로 승격됩니다.

```java
byte a = 10;
byte b = 20;

// byte c = a + b; // 컴파일 오류
int c = a + b;
```

두 피연산자가 `byte`라고 해서 결과도 자동으로 `byte`가 되는 것이 아닙니다. 문제에서 결과 타입을 묻는다면 변수 선언 타입만 보지 말고 **연산 전에 어떤 숫자 승격이 일어나는지** 확인해야 합니다.

상수 표현식은 컴파일러가 값의 범위를 확인할 수 있기 때문에 일부 예외적인 대입이 허용됩니다.

```java
byte x = 10 + 20; // 30은 byte 범위 안이므로 허용
```

반면 변수 연산은 같은 방식으로 처리되지 않습니다.

### 정수 범위를 넘으면 값이 돌아간다

`int`의 최댓값에서 1을 더해 보겠습니다.

```java
int value = Integer.MAX_VALUE;
System.out.println(value);      // 2147483647
System.out.println(value + 1);  // -2147483648
```

Java 정수 연산은 표현 범위를 넘었다고 자동으로 `ArithmeticException`을 던지지 않습니다. 결과는 해당 정수 타입의 비트 폭에 맞춰 계산되어 값이 돌아갑니다. 이를 **overflow**라고 부릅니다.

이 때문에 개수, 금액의 최소 단위, 시간 합산처럼 값이 커질 수 있는 계산은 타입 범위를 먼저 확인해야 합니다. `int` 두 개를 더한 뒤 `long`에 넣는다고 이미 발생한 overflow가 복구되지는 않습니다.

```java
int a = 2_000_000_000;
int b = 2_000_000_000;

long wrong = a + b;          // int 연산에서 이미 overflow
long right = (long) a + b;   // 한쪽을 long으로 올린 뒤 long 연산
```

### 실수 타입은 다른 문제를 가진다

`float`와 `double`은 매우 큰 범위를 표현할 수 있지만 모든 십진수를 정확하게 표현하는 것은 아닙니다.

```java
System.out.println(0.1 + 0.2); // 보통 기대하는 0.3과 정확히 같지 않게 보일 수 있음
```

이것은 정수 overflow와 다른 문제입니다. 금액처럼 십진수 정확성이 중요한 영역에서는 단순히 `double`을 사용하는 것보다 `BigDecimal` 같은 타입을 검토해야 합니다. 자세한 숫자 모델링은 별도 주제에서 다룹니다.

### 문제를 풀 때 확인할 것

숫자 코드에서 결과를 예측할 때는 다음 순서가 안전합니다.

1. 각 피연산자의 타입은 무엇인가?
2. 연산 전에 숫자 승격이 일어나는가?
3. 연산 자체는 `int`, `long`, `float`, `double` 중 어떤 타입으로 수행되는가?
4. 결과가 그 타입의 범위를 넘는가?
5. 형변환은 연산 전인가, 연산 후인가?

이 순서를 지키면 단순히 “`long` 변수에 받았으니 안전하다” 같은 실수를 피할 수 있습니다.
