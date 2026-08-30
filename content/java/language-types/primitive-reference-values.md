---
kind: concept
contentKey: java.core.language-types.primitive-reference-values
topicContentKey: java.core.language-types
slug: primitive-reference-values
title: "원시 값과 참조 값"
summary: "Java 변수에 담기는 값의 종류와 객체 identity를 혼동하지 않는다"
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
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html"
    title: "Java Virtual Machine Specification 2장: The Structure of the JVM"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: JVM의 primitive/reference value 구분과 추상 머신 경계 확인
---
# 원시 값과 참조 값

## 쉬운 진입

`int count = 1`과 `String name = "Java"`는 모두 변수에 어떤 **값**을 담는다. 다만
`count`에는 숫자 값이, `name`에는 문자열 객체를 찾아갈 수 있는 참조 값이 담긴다. 참조를
곧바로 C의 포인터나 OS가 보장하는 물리 메모리 주소라고 생각하면 Java가 보장하는 범위를 넘어서게 된다.

## 정확한 메커니즘

Java 언어는 값을 원시 값과 참조 값으로 나눈다. 참조 값은 객체 identity를 식별하고 객체가
없음을 나타내는 `null`도 될 수 있다. 참조 변수 대입은 객체를 복제하지 않고 참조 값을 복사한다.

```java
String first = new String("cs");
String second = first;

System.out.println(first == second);        // true: 같은 객체 identity
System.out.println(first.equals(second));   // true: 같은 문자열 내용
```

```text
first  ─┐
        ├── 참조 값 ──> String 객체("cs")
second ─┘
```

`==`는 참조형에서 같은 객체인지 비교하고, `equals`는 해당 타입이 정의한 논리적 동등성을
사용한다. 모든 참조 타입이 값 기반 `equals`를 제공하는 것은 아니므로 타입의 계약을 확인해야 한다.

## 실전·면접 연결

메서드 설계에서 객체를 넘겼다는 사실만으로 복사가 일어났다고 가정하지 않는다. 가변 객체의
소유권과 변경 가능성을 API 계약에 적고, identity 비교가 필요한 경우와 값 비교가 필요한 경우를
구분한다. JVM이 참조를 실제로 어떻게 표현하거나 배치하는지는 JVM 구현의 영역이며 Java 코드의
일반적인 언어 계약으로 고정하지 않는다.

## 흔한 오해

- 참조 값은 반드시 물리 주소라는 설명은 Java 언어 보장이 아니다.
- 참조 변수 대입은 객체 전체 복사가 아니다.
- 참조형이라고 항상 `equals`가 내용 비교를 한다고 가정하지 않는다.
