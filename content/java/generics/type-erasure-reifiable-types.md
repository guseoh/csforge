---
kind: concept
contentKey: java.core.generics.type-erasure-reifiable-types
topicContentKey: java.core.generics
slug: type-erasure-reifiable-types
title: "타입 소거와 런타임에 남는 타입 정보"
summary: "Java 제네릭 타입 정보가 컴파일 후 모두 같은 방식으로 남지 않는 이유와 reifiable type, 제네릭 배열 등 실질적 제약을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6"
    title: "JLS 4.6 Type Erasure"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 타입 소거 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.7"
    title: "JLS 4.7 Reifiable Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 런타임에 완전히 표현 가능한 타입 범주 확인
---
# 타입 소거와 런타임에 남는 타입 정보

`List<String>`과 `List<Integer>`는 컴파일할 때 분명히 다른 타입으로 검사됩니다. 그런데 런타임에 다음 검사를 할 수는 없습니다.

```java
// if (value instanceof List<String>) { } // 허용되지 않음
```

Java 제네릭은 **타입 소거(type erasure)** 를 사용하기 때문에 매개변수화 타입의 타입 인자 정보가 런타임에 모두 그대로 표현되는 것은 아닙니다.

### 컴파일러가 타입 안전성을 먼저 검사한다

```java
List<String> names = new ArrayList<>();
names.add("java");
String name = names.getFirst();
```

컴파일러는 `String`만 넣고 읽도록 검사합니다. 이후 class file 수준에서는 제네릭 타입이 소거된 형태와 필요한 cast, bridge method 등이 사용될 수 있습니다.

이것을 “제네릭 정보는 런타임에 100% 전부 사라진다”라고 너무 단순하게 말하면 안 됩니다. class file의 Signature 같은 metadata나 reflection으로 일부 generic 선언 정보를 읽을 수 있습니다. 중요한 것은 **런타임 객체가 `List<String>`과 `List<Integer>`라는 완전한 타입 인자를 서로 다른 런타임 클래스처럼 가지고 있지는 않다**는 점입니다.

### reifiable type이란 무엇인가

런타임에서 타입을 완전히 표현할 수 있는 범주의 타입을 **reifiable type**이라고 합니다. 일반 클래스, raw type, unbounded wildcard를 사용한 일부 타입 등이 해당합니다.

반면 `List<String>` 같은 구체 매개변수화 타입은 일반적으로 reifiable하지 않습니다. 그래서 다음 같은 제약이 생깁니다.

```java
// new T();
// new List<String>[10];
// value instanceof List<String>
```

각 문장이 제한되는 세부 이유는 조금씩 다르지만 공통 배경에는 **런타임에 필요한 타입 정보를 일반적인 객체 타입처럼 사용할 수 없는 제네릭 모델**이 있습니다.

### 배열과 제네릭의 차이가 다시 나타난다

배열은 런타임 원소 타입을 알고 저장 시 검사합니다. 반면 제네릭 타입 인자는 같은 방식으로 런타임 배열 component type이 되지 않습니다. 그래서 `new List<String>[10]` 같은 배열 생성을 허용하면 배열의 runtime store check와 제네릭 타입 안전성이 충돌할 수 있습니다.

### reflection과 혼동하지 않는다

```java
Field field = MyClass.class.getDeclaredField("names");
Type type = field.getGenericType();
```

선언 metadata에서 `List<String>` 정보를 읽을 수 있는 경우가 있습니다. 이것은 모든 `ArrayList` 인스턴스가 런타임에 자신의 원소 타입 `String`을 완전하게 보유한다는 뜻이 아닙니다.

### 문제를 풀 때 확인할 것

- 지금 필요한 타입 정보는 컴파일 시점 정보인가 런타임 정보인가?
- 대상 타입은 reifiable한가?
- `instanceof`, 배열 생성, class literal처럼 런타임 타입이 필요한 연산인가?
- reflection metadata와 런타임 객체 타입을 혼동하고 있지 않은가?

이 구분이 되면 타입 소거 관련 제한을 단순 암기가 아니라 이유로 이해할 수 있습니다.
