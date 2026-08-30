---
kind: concept
contentKey: java.core.object-model.class-object-constructor
topicContentKey: java.core.object-model
slug: class-object-constructor
title: "Class, object와 constructor"
summary: "class 설계와 object 생성, constructor의 역할을 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class, field, method, constructor 선언 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html"
    title: "Java Language Specification 12장: Execution"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: class와 instance 생성 실행 순서 확인
---
# Class, object와 constructor

## 쉬운 진입

class는 같은 종류의 상태와 행동을 설명하는 타입이다. JLS에서 object는 실행 중 동적으로 생성되는
class instance 또는 array를 뜻하며, 이 Concept에서는 class instance를 중심으로 본다. object 자체와
그 object를 가리키는 reference value는 서로 다른 개념이다. constructor는 새 class instance가 외부에
사용되기 전에 필요한 초기 상태와 생성 규칙을 적용하는 경계다.

## 정확한 메커니즘

```java
final class User {
    private final String name;

    User(String name) {
        this.name = name;
    }
}

User first = new User("A");
User second = new User("A");
```

`User`는 타입을 정의하고 `first`, `second`는 서로 다른 reference variable이며 각각 별개의
`User` instance를 가리킨다. 두 instance가 같은 문자열 상태를 가질 수 있어도 identity는 별개다.
class instance creation expression의 `new`는 적절한 constructor 호출로 이어지고, constructor끼리의
연결에는 `this(...)`나 `super(...)`가 사용될 수 있다. constructor는 반환 타입을 선언하지 않는다.
생성 시 필수 상태를 검증하면 유효하지 않은 object가 외부에 공개되는 일을 줄일 수 있다.
생성자를 하나도 선언하지 않은 경우에만 컴파일러가 default constructor를 암시적으로 선언할 수 있다.

## 실전·면접 연결

entity·value object·service를 만들 때 “어떤 상태가 있어야 유효한가”를 constructor 또는
factory 계약에 적는다. 모든 field를 public으로 열고 나중에 맞추는 방식은 object가 유효한지
호출자가 계속 추적하게 만든다. 생성은 Java 언어 규칙이고 Spring Bean lifecycle은 별도 framework
책임이다.

## 흔한 오해

- class를 선언했다고 object가 하나 자동 생성되는 것은 아니다.
- 같은 field 값을 가진 object가 반드시 같은 identity인 것은 아니다.
- object 자체와 object를 가리키는 reference value를 같은 것으로 취급하지 않는다.
- constructor는 일반 메서드처럼 반환 타입을 선언하는 API가 아니다.
