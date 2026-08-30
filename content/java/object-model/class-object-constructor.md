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

class는 같은 종류의 상태와 행동을 설명하는 설계도이고, object는 그 설계도로 실제 만들어진
하나의 값이다. constructor는 object가 외부에 사용되기 전에 필요한 초기 상태를 만들기 위한
생성 경계다. 설계도와 실제 집을 같은 것으로 취급하지 않는 것처럼 class와 object도 구분한다.

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

`User`는 타입을 정의하고 `first`, `second`는 서로 다른 object reference다. 두 object가 같은
문자열 상태를 가질 수 있어도 identity는 별개다. constructor는 반환 타입이 없고 `new`와 함께
호출되며, 생성자에서 필수 상태를 검증하면 유효하지 않은 object가 공개되는 일을 줄일 수 있다.
생성자를 하나도 선언하지 않은 경우에만 컴파일러가 기본 생성자를 제공할 수 있다.

## 실전·면접 연결

entity·value object·service를 만들 때 “어떤 상태가 있어야 유효한가”를 constructor 또는
factory 계약에 적는다. 모든 field를 public으로 열고 나중에 맞추는 방식은 object가 유효한지
호출자가 계속 추적하게 만든다. 생성은 Java 언어 규칙이고 Spring Bean lifecycle은 별도 framework
책임이다.

## 흔한 오해

- class를 선언했다고 object가 하나 자동 생성되는 것은 아니다.
- 같은 field 값을 가진 object가 반드시 같은 identity인 것은 아니다.
- constructor는 메서드처럼 반환 타입을 선언하는 API가 아니다.
