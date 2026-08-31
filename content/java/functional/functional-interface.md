---
kind: concept
contentKey: java.core.functional.functional-interface
topicContentKey: java.core.functional
slug: functional-interface
title: "Functional interface"
summary: "단일 abstract method 계약과 표준 함수형 인터페이스를 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: functional interface의 언어 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/FunctionalInterface.html"
    title: "Java SE 25 API: FunctionalInterface"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: annotation의 검증 역할 확인
---
# Functional interface

## 쉬운 진입

동작 하나를 전달하고 싶을 때 작은 객체 클래스를 매번 만들면 목적보다 코드가 커진다.
functional interface는 “이 자리에 어떤 동작 하나를 제공하라”는 타입 계약으로, lambda나
method reference를 받을 수 있게 한다.

## 정확한 메커니즘

추상 메서드가 하나인 interface가 functional interface다. `Object`의 public method와
default/static method는 그 수를 단순히 늘리지 않는다. `@FunctionalInterface`는 compiler가
이 의도를 검증하는 annotation이지 lambda를 실행시키는 마법이 아니다.

```java
@FunctionalInterface
interface Formatter { String format(String value); }
Formatter upper = String::toUpperCase;
```

표준 라이브러리에는 입력과 출력 형태에 따라 `Predicate<T>`(boolean), `Function<T,R>`(변환),
`Consumer<T>`(소비), `Supplier<T>`(공급) 등이 있다. `Runnable`은 인자·반환이 없는 동작이다.

## 실전·면접 연결

함수형 인터페이스를 고르면 호출자가 제공해야 할 정보와 결과가 코드에 드러난다. 검사와
변환을 하나의 `Function`에 억지로 넣기보다 서로 다른 계약을 사용한다. interface에 두 번째
abstract method가 필요해지면 lambda API로서의 경계가 깨진다.

## 흔한 오해

- abstract method가 하나라고 interface가 상태를 가질 수 없다는 뜻은 아니다.
- `@FunctionalInterface`가 없으면 lambda를 사용할 수 없는 것은 아니다.
- lambda의 실제 target type은 별도의 문맥에서 결정된다.
