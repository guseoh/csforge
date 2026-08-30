---
kind: concept
contentKey: java.core.language-types.primitive-reference
topicContentKey: java.core.language-types
slug: primitive-reference
title: 원시 값과 참조 값
summary: Java의 타입 분류와 값의 의미를 구분해 변수와 메서드 호출을 읽는 기초
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 원시 타입·참조 타입과 값의 언어 규칙 확인
---
# 원시 값과 참조 값

Java의 타입은 크게 원시 타입과 참조 타입으로 나뉩니다. `int`, `long`, `double`, `boolean` 같은 원시 타입 변수에는 그 타입의 값이 직접 들어갑니다. 클래스, 배열, 인터페이스 타입 변수에는 객체 자체가 아니라 객체를 가리키는 참조 값이 들어갑니다. 참조 값에는 참조할 객체가 없다는 의미의 `null`도 포함될 수 있습니다.

```java
int count = 3;
String name = "CSForge";
String other = name;
```

`count`를 다른 변수에 대입하면 숫자 값이 복사됩니다. `name`을 `other`에 대입하면 같은 문자열 객체를 가리키는 참조 값이 복사됩니다. 이것은 “변수에 객체가 물리적으로 들어 있다”는 뜻이 아니라, 참조 타입의 값이 객체를 식별한다는 언어 수준의 의미입니다.

## 왜 중요한가

참조 값이 복사된다고 해서 객체가 복제되는 것은 아닙니다. 따라서 가변 객체를 여러 곳에서 가리키면 한 곳의 변경이 다른 곳에서 관찰될 수 있습니다. 반대로 `String`처럼 불변인 객체는 같은 객체를 공유해도 내용이 바뀌지 않습니다.

Java 언어는 값의 의미와 구현 장치의 위치를 보장하지만, 모든 원시 값이 항상 스택에 있고 모든 객체가 항상 힙에 있다는 식의 물리적 배치를 보장하지는 않습니다. JIT 최적화나 escape analysis가 실제 배치를 바꿀 수 있습니다.

## 흔한 오해

“참조 타입은 주소를 전달한다”라고만 외우면 위험합니다. 메서드 호출도 항상 값 전달이며, 참조 타입에서는 참조 값이 값으로 복사됩니다. 이 차이는 `java.core.language-types.pass-by-value`에서 더 자세히 다룹니다.
