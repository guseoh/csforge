---
kind: concept
contentKey: java.core.generics.generic-types-methods
topicContentKey: java.core.generics
slug: generic-types-methods
title: "제네릭 타입과 메서드"
summary: "타입 매개변수로 컬렉션과 알고리즘의 타입 안전성을 컴파일 시점에 확보한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html"
    title: "Java SE 25 List API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 제네릭 컬렉션 API 사용 예 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5"
    title: "Java Language Specification 4.5장: Parameterized Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: parameterized type의 언어 의미 확인
---
# 제네릭 타입과 메서드

## 쉬운 진입

`List<String>`은 문자열만 담는 목록이라는 약속을 컴파일러와 공유한다. 꺼낼 때 매번
캐스팅하지 않아도 되고, 잘못된 타입을 넣는 코드를 실행 전에 발견할 수 있다.

## 정확한 메커니즘

```java
static <T> T first(List<T> values) {
    return values.getFirst();
}

List<String> names = new ArrayList<>();
String name = first(names);
```

`T`는 호출 시 구체 타입으로 추론되는 type parameter다. 클래스/인터페이스의 타입 매개변수와
메서드 타입 매개변수는 서로 다른 선언이며, `List<Object>`와 `List<String>`의 관계는
별도 invariance 규칙으로 결정된다.

## 실전·면접 연결

제네릭은 API가 허용하는 입력과 반환 타입을 문서화하고 컴파일러의 도움을 받게 한다. 타입을
아무거나 받으려고 `Object`와 캐스팅을 늘리기보다 필요한 관계를 type parameter나 wildcard로
표현한다.

## 흔한 오해

- 제네릭 타입 정보가 모든 실행 시점에 남아 있는 것은 아니다.
- `T`가 항상 `Object`와 같은 뜻은 아니다. 호출 문맥의 타입 제약이다.
- 제네릭을 붙였다고 원소 객체의 내부 변경 가능성까지 사라지지 않는다.
