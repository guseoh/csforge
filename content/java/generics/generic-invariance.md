---
kind: concept
contentKey: java.core.generics.generic-invariance
topicContentKey: java.core.generics
slug: generic-invariance
title: "제네릭의 불공변성과 배열의 공변성"
summary: "List<Child>를 List<Parent>로 볼 수 없는 이유와 배열의 런타임 검사를 비교한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.10.2"
    title: "Java Language Specification 4.10.2장: Subtyping among Class and Interface Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 배열/참조 타입의 subtyping 관계 확인
  - url: "https://docs.oracle.com/javase/tutorial/java/generics/inheritance.html"
    title: "Oracle Java Tutorial: Generics, Inheritance, and Subtypes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: parameterized type의 상속 관계 설명 참고
---
# 제네릭의 불공변성과 배열의 공변성

## 쉬운 진입

`Cat`은 `Animal`이지만 `List<Cat>`을 `List<Animal>`로 바꿔 부르면 누군가 `Dog`를 넣을 수
있게 된다. 그래서 Java 제네릭은 기본적으로 서로 다른 타입 매개변수 사이의 상속 관계를
자동으로 만들지 않는다.

## 정확한 메커니즘

```java
List<Cat> cats = new ArrayList<>();
// List<Animal> animals = cats; // compile error

Animal[] animals = new Cat[1]; // 배열은 공변
animals[0] = new Dog();        // ArrayStoreException
```

불공변성은 Java의 subtyping 규칙이다. `List<Cat>`을 `List<Animal>`로 허용하면 `Dog`를
쓰는 코드도 허용되어 Cat 목록의 타입 계약을 깨뜨리므로 이 대입을 컴파일 시점에 거부한다.
배열은 공변 대입을 허용하되 실제 component type으로 저장을 검사한다.
erasure는 타입 인자의 런타임 표현에 관한 별도 규칙이며 불공변성의 원인과 동일시하지 않는다.

## 실전·면접 연결

생산/소비 용도를 wildcard로 표현하면 제네릭의 유연성과 안전성을 함께 얻을 수 있다.
배열 API와 제네릭 API를 변환할 때는 `ArrayStoreException`과 unchecked 경고를 모두 고려한다.

## 흔한 오해

- `List<Cat>`가 `List<Animal>`이 아닌 것은 Cat이 Animal이 아니어서가 아니다.
- 배열의 공변성이 편리해 보여도 타입 오류가 런타임으로 미뤄진다.
- wildcard를 붙이면 모든 제네릭 타입이 자동으로 상하위 관계가 되는 것은 아니다.
