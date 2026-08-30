---
kind: concept
contentKey: java.core.generics.raw-types-unchecked
topicContentKey: java.core.generics
slug: raw-types-unchecked
title: "Raw type과 unchecked 경고"
summary: "제네릭을 생략한 legacy API가 타입 안전성을 어디에서 잃는지 추적한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.8"
    title: "Java Language Specification 4.8장: Raw Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: raw type의 언어 의미와 비검사 변환 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html"
    title: "Java SE 25 List API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: parameterized collection 사용 기준 확인
---
# Raw type과 unchecked 경고

## 쉬운 진입

`List`라고만 쓰면 어떤 원소든 들어갈 수 있던 Java 5 이전 API와 호환되지만, 꺼낼 때 타입을
믿을 근거가 없다. `List<String>`이라고 쓰는 순간 컴파일러가 그 경계를 검사한다.

## 정확한 메커니즘

```java
List raw = new ArrayList();
raw.add("java");
raw.add(25);
List<String> names = raw; // unchecked conversion 경고
String first = names.get(1); // ClassCastException 가능
```

raw type은 legacy 호환을 위해 허용되며 unchecked 경고는 컴파일러가 타입 안전성을 증명할 수
없다는 신호다. `@SuppressWarnings("unchecked")`는 경고를 없애는 주문이 아니라 검증 가능한
좁은 경계에만 붙이고 근거를 남겨야 한다.

## 실전·면접 연결

외부 legacy API를 감싼 adapter에서 raw 값을 즉시 검증·복사해 타입화된 컬렉션으로 바꾸면
위험이 시스템 전체로 퍼지지 않는다. 새 코드의 API에는 raw type을 사용하지 않는다.

## 흔한 오해

- unchecked 경고가 곧 즉시 오류라는 뜻은 아니지만 잠재적 런타임 오류다.
- `@SuppressWarnings`는 실제 타입 검증을 추가하지 않는다.
- `List<Object>`는 raw `List`와 다르며 모든 값을 명시적으로 Object로 다루는 타입화된 목록이다.
