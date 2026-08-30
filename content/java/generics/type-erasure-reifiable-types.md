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
raw type, unbounded wildcard parameterization 등이 포함된다. 그래서 `new T[]`,
`value instanceof List<String>`, `List<String>.class` 같은 표현은 허용되지 않는다.

## 실전·면접 연결

런타임 타입 토큰이나 `Class<T>`를 넘겨야 실제 원소 타입에 맞춰 배열·변환을 만들 수 있다.
reflection이나 serialization 경계에서는 erasure로 잃은 정보가 필요한지 먼저 확인한다.
bridge method 등 컴파일러 생성물이 보일 수 있지만 이를 일반 API 계약으로 의존하지 않는다.

## 흔한 오해

- erasure는 제네릭이 전혀 검증되지 않는다는 뜻이 아니다. 컴파일러가 source type check를 한다.
- 모든 타입이 완전히 Object로 바뀐다고 단순화하면 bounded type과 primitive specialization의 차이를 놓친다.
- `instanceof List<?>`는 가능하지만 `instanceof List<String>`은 불가능하다.
