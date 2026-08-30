---
kind: concept
contentKey: java.core.language-types.string-immutability-equality
topicContentKey: java.core.language-types
slug: string-immutability-equality
title: "String immutability와 equality"
summary: "String의 불변성, == identity 비교와 equals 내용 비교를 구분한다"
level: 1
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html"
    title: "Java SE 25 String API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: String 불변성 및 문자열 API 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html"
    title: "Java SE 25 Object API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: equals의 기본 객체 계약 확인
---
# String immutability와 equality

## 쉬운 진입

문자열 변수에 다른 글을 붙인 것처럼 보여도 기존 `String` 객체의 글자가 직접 바뀌는 것은 아니다.
Java의 `String`은 불변이라 연산 결과로 새 문자열 값이 만들어진다. 그리고 두 문자열이 같은
문장을 담았는지와 같은 객체인지도 별개의 질문이다.

## 정확한 메커니즘

```java
String first = new String("cs");
String second = new String("cs");

System.out.println(first == second);       // false: 다른 객체 identity
System.out.println(first.equals(second));  // true: 같은 내용

String changed = first + "forge";          // first는 그대로, 결과는 새 String 값
```

참조형의 `==`는 같은 객체인지(identity)를 비교하고 `equals`는 타입이 정의한 논리적 동등성을
비교한다. `String.equals`는 문자 내용 기준이다. 불변성은 공유 중인 String을 누군가 몰래 바꿀
수 없게 하므로 캐시·thread 간 전달·hash 기반 컬렉션 사용을 단순하게 한다.

## 실전·면접 연결

입력·DB·HTTP에서 온 문자열은 내용 비교가 목적이면 `equals`를 사용한다. null 가능 값은
`Objects.equals` 같은 null-safe 경계를 선택한다. 반복적인 문자열 조립은 `StringBuilder`가
더 적합할 수 있으며, 단순 `+` 한두 번을 무조건 문제로 취급하지 않는다.

## 흔한 오해

- 같은 내용이면 `==`가 항상 true인 것은 아니다.
- `String` 변수에 새 값을 대입하는 것은 기존 객체 mutation이 아니다.
- String pool의 공유 가능성과 `equals`의 내용 계약은 같은 개념이 아니다.
