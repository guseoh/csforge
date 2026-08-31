---
kind: concept
contentKey: java.core.language-types.boxing-unboxing-wrapper
topicContentKey: java.core.language-types
slug: boxing-unboxing-wrapper
title: "Boxing, unboxing과 wrapper 타입"
summary: "원시 값과 래퍼 객체 사이의 자동 변환, null 역변환 위험, == 비교와 캐시 오해를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.7"
    title: "JLS 5.1.7 Boxing Conversion"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: boxing 규칙과 일부 값의 동일성 보장 범위 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.8"
    title: "JLS 5.1.8 Unboxing Conversion"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: unboxing과 null 처리 규칙 확인
---
# Boxing, unboxing과 wrapper 타입

컬렉션이나 제네릭은 `int` 같은 원시 타입을 타입 인자로 직접 사용할 수 없습니다. 그래서 Java에는 원시 값을 객체 형태로 다룰 수 있도록 `Integer`, `Long`, `Boolean` 같은 **래퍼(wrapper) 타입**이 있습니다.

원시 값을 래퍼 타입으로 바꾸는 것을 **boxing**, 래퍼 객체에서 원시 값을 꺼내는 것을 **unboxing**이라고 합니다. Java는 많은 문맥에서 이 변환을 자동으로 해 주지만, 자동 변환이라는 이유로 비용과 오류 가능성까지 사라지는 것은 아닙니다.

### 코드에서 자동 변환은 어떻게 보일까

```java
Integer boxed = 10;  // int 10을 Integer로 boxing
int value = boxed;   // Integer를 int로 unboxing
```

개념적으로는 다음과 비슷하게 생각할 수 있습니다.

```java
Integer boxed = Integer.valueOf(10);
int value = boxed.intValue();
```

실제 컴파일 결과의 세부는 구현에 맡겨져 있지만, 코드를 이해할 때는 원시 값과 객체 사이의 변환이 숨어 있다는 사실을 기억하면 됩니다.

### 가장 위험한 경우는 `null`을 unboxing할 때다

래퍼 타입은 참조 타입이므로 `null`을 가질 수 있습니다.

```java
Integer count = null;
int value = count; // NullPointerException
```

`int`에는 `null`이라는 값이 없으므로 unboxing 과정에서 실제 `Integer` 객체가 필요합니다. 그런데 객체가 없기 때문에 `NullPointerException`이 발생합니다.

백엔드 코드에서는 DB 조회 결과, 요청 DTO, `Map` 조회 결과처럼 `null`이 들어올 수 있는 값을 래퍼 타입으로 표현하는 경우가 많습니다. 이후 산술 연산이나 비교 과정에서 자동 unboxing이 일어나면 예외가 예상하지 못한 위치에서 발생할 수 있습니다.

```java
Integer stock = repositoryResult;
if (stock > 0) { // stock이 null이면 비교 전에 unboxing하다 실패
    // ...
}
```

### `Integer`의 `==`는 값 비교가 아니다

```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b);
```

일부 작은 정수 값에서는 같은 `Integer` 객체가 재사용될 수 있어서 위 결과가 `true`가 될 수 있습니다. Java 언어 명세는 특정 상수 표현식의 boxing에 대해 일부 값 범위에서 동일 객체가 되도록 보장하는 규칙을 두고 있습니다.

하지만 이것을 “Integer는 작은 값이면 항상 `==`로 비교해도 된다”로 사용하면 안 됩니다.

```java
Integer x = 1000;
Integer y = 1000;
System.out.println(x == y);      // 값 비교 용도로 믿으면 안 됨
System.out.println(x.equals(y)); // true
```

참조 타입의 `==`는 **같은 객체를 가리키는지** 비교합니다. 숫자 값의 논리적 동등성을 비교하려면 `equals`를 사용하거나, `null` 가능성을 확인한 뒤 원시 값으로 비교해야 합니다.

### 반복문 안의 boxing은 성능에도 영향을 줄 수 있다

boxing은 원시 값을 객체 형태로 다루게 만듭니다. 따라서 대량의 숫자를 `List<Integer>`에 저장하거나 반복적으로 boxing하는 코드는 원시 배열에 비해 객체 관리 비용이 생길 수 있습니다.

다만 “boxing은 무조건 느리니 피한다”가 결론은 아닙니다. 일반적인 도메인 코드에서는 타입 의미와 API 계약이 더 중요할 수 있습니다. 실제 성능 문제가 있다면 allocation과 실행 시간을 측정한 뒤 판단해야 합니다.

### 문제를 풀 때 확인할 것

래퍼 타입이 나오면 세 가지를 확인합니다.

- 현재 값이 원시 값인가, 래퍼 객체인가?
- 산술·비교 과정에서 자동 unboxing이 숨어 있는가?
- `==`가 값 비교처럼 보이지만 실제로는 객체 동일성을 비교하고 있지 않은가?

특히 `null`과 `==` 두 지점이 문제에서 자주 함정이 됩니다.
