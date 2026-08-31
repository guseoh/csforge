---
kind: concept
contentKey: java.core.generics.generic-varargs-heap-pollution
topicContentKey: java.core.generics
slug: generic-varargs-heap-pollution
title: "Generic varargs와 heap pollution"
summary: "가변 인자 배열과 erasure가 타입 안전성을 깨뜨리는 경로를 차단한다"
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1"
    title: "Java Language Specification 8.4.1장: Formal Parameters"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: variable arity parameter의 언어 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.2"
    title: "Java Language Specification 4.12.2장: Variables of Reference Type"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: heap pollution 용어와 참조 타입 변수 의미 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/SafeVarargs.html"
    title: "Java SE 25 SafeVarargs API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: 가변 인자 생성자와 메서드 적용 조건 및 안전성 보증 확인
---
# Generic varargs와 heap pollution

## 쉬운 진입

`List<String>...`처럼 제네릭 타입을 varargs로 받으면 컴파일러는 결국 배열을 만들어야
하지만 `List<String>[]`를 안전하게 만들 수 없다. 잘못된 참조가 들어가면 선언한 타입과
실제 객체의 타입이 어긋나는 heap pollution이 생긴다.

## 정확한 메커니즘

```java
@SafeVarargs
static <T> List<T> first(List<T>... lists) {
    return lists[0];
}
```

제네릭 varargs는 unchecked 경고를 만들 수 있다. `@SafeVarargs`는 메서드가 varargs 배열을
외부에 노출하거나 다른 타입을 저장하지 않아 실제로 안전하다는 작성자의 보증일 때만
사용한다. 단순히 경고를 숨기기 위해 붙이면 오류를 가린다. Java SE 25에서는 가변 인자
생성자에도 적용할 수 있다. 가변 인자 메서드에는 오버라이드할 수 없는 static/final/private
메서드라는 제약이 있다. 선언에 붙일 수 있는 조건과 본문이 실제로 안전한지는 별도로 검토한다.

## 실전·면접 연결

가능하면 `List<List<T>>`처럼 컬렉션 매개변수로 API를 바꾸고, varargs가 꼭 필요하면 입력을
읽기만 하는지와 배열을 저장하지 않는지를 검토한다. public 경계에서 unchecked warning을
방치하지 말고 테스트로 다양한 타입 조합을 확인한다.

## 흔한 오해

- `@SafeVarargs`가 런타임 검사를 추가해 주는 것은 아니다.
- 제네릭 varargs가 항상 즉시 예외를 던지는 것은 아니며 오염은 나중에 드러날 수 있다.
- 배열 varargs를 사용한다고 해서 모든 generic method가 unsafe인 것은 아니다.
