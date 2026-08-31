---
kind: concept
contentKey: java.core.generics.type-erasure-reifiable-types
topicContentKey: java.core.generics
slug: type-erasure-reifiable-types
title: "Type erasure와 reifiable type"
summary: "제네릭 타입 정보가 컴파일 후 무엇을 알 수 있고 알 수 없는지 판단한다"
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6"
    title: "Java Language Specification 4.6장: Type Erasure"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: type erasure 변환 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.7"
    title: "Java Language Specification 4.7장: Reifiable Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 런타임에 완전히 표현 가능한 타입 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.20.2"
    title: "Java Language Specification 15.20.2장: The instanceof Operator"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: 피연산자의 정적 타입에 따른 parameterized instanceof 허용 범위 확인
---
# Type erasure와 reifiable type

## 쉬운 진입

`List<String>`와 `List<Integer>`는 소스에서 다르지만 일반적인 실행 시점에는 JVM이 원소의
제네릭 인자를 직접 검사할 수 없다. 제네릭은 주로 컴파일 타임 안전성을 제공하고, 호환을
위해 타입 인자 정보가 지워진다.

## 정확한 메커니즘

```text
List<String>  ──compile──> List (대략적인 실행 표현)
List<Integer> ──compile──> List
```

reifiable type은 실행 시 타입 정보가 완전히 표현되는 타입으로 primitive, non-generic class,
raw type, unbounded wildcard parameterization 등이 포함된다. 임의의 타입 변수 T에 대한
`new T[]`와 `List<String>.class`는 허용되지 않는다. `Object value`에 대한
`value instanceof List<String>`도 String 타입 인자를 런타임에 검사할 수 없어 거부된다.
Java SE 25의 instanceof 허용 여부는 피연산자의 정적 타입에서 검사 대상 타입으로의
변환에 unchecked 검사가 필요한지에 달려 있으므로 모든 parameterized 타입 검사를
무조건 금지한다고 일반화하지 않는다.

## 실전·면접 연결

런타임 타입 토큰이나 `Class<T>`를 넘겨야 실제 원소 타입에 맞춰 배열·변환을 만들 수 있다.
reflection이나 serialization 경계에서는 erasure로 잃은 정보가 필요한지 먼저 확인한다.
bridge method 등 컴파일러 생성물이 보일 수 있지만 이를 일반 API 계약으로 의존하지 않는다.

## 흔한 오해

- erasure는 제네릭이 전혀 검증되지 않는다는 뜻이 아니다. 컴파일러가 source type check를 한다.
- 타입 변수의 erasure는 bound에 영향을 받으며 모든 타입이 무조건 Object가 되는 것은 아니다.
- Object 값의 `instanceof List<?>`는 List 종류만 검사하며 원소가 String인지 보장하지 않는다.
