---
kind: concept
contentKey: java.core.generics.generic-varargs-heap-pollution
topicContentKey: java.core.generics
slug: generic-varargs-heap-pollution
title: "제네릭 varargs와 heap pollution"
summary: "제네릭 타입과 배열 기반 varargs가 만날 때 타입 안전성이 깨질 수 있는 이유와 SafeVarargs를 붙일 수 있는 조건을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.2"
    title: "JLS 4.12.2 Variables of Reference Type"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: heap pollution 정의와 관련 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/SafeVarargs.html"
    title: "Java SE 25 API: SafeVarargs"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: SafeVarargs 적용 대상과 프로그래머의 안전성 약속 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.6.4.7"
    title: "JLS 9.6.4.7 @SafeVarargs"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: SafeVarargs가 억제하는 경고와 선언 제약의 언어 규칙 확인
---
# 제네릭 varargs와 heap pollution

varargs는 호출 시 여러 인자를 편하게 넘기게 해 주지만 구현에서는 배열과 연결됩니다.

```java
static void print(String... values) { }
```

문제는 배열은 런타임 component type을 검사하는 반면 `List<String>` 같은 매개변수화 타입은 일반적으로 reifiable하지 않다는 점입니다. 이 둘이 만나면 컴파일러가 타입 안전성을 완전히 증명하기 어려운 경계가 생깁니다.

### 제네릭 varargs에서 왜 경고가 생길까

```java
static <T> void process(List<T>... lists) {
    // ...
}
```

`List<T>`는 reifiable type이 아닙니다. 그런데 varargs를 표현하려면 배열이 필요합니다. 이 배열을 더 넓은 배열 타입으로 바라본 뒤 다른 매개변수화 타입을 넣으면 선언 타입과 실제 객체 타입이 어긋날 수 있습니다.

```java
static void unsafe(List<String>... lists) {
    Object[] array = lists;
    array[0] = List.of(42);

    String value = lists[0].getFirst(); // 런타임 실패 가능
}
```

호출 시 만들어지는 배열의 런타임 component type은 `List[]` 수준이므로 `List<Integer>`를 저장하는 순간 generic type argument 차이를 검사하지 못할 수 있습니다. 이후 코드는 `lists[0]`을 `List<String>`이라고 믿고 읽기 때문에 `ClassCastException`이 드러납니다.

```text
List<String>[]처럼 사용하는 varargs 배열
          │ Object[]로 별칭
          ▼
List<Integer> 저장
          │ runtime component는 List 수준
          ▼
선언상 List<String>이라고 믿고 읽음
          │
          ▼
String 변환 지점에서 실패
```

이처럼 parameterized type 변수의 타입 계약과 실제 가리키는 객체가 어긋나는 상태를 **heap pollution**이라고 합니다.

### `@SafeVarargs`는 안전성을 추가하지 않는다

```java
@SafeVarargs
static <T> void safeUse(T... values) {
    for (T value : values) {
        consume(value);
    }
}
```

`@SafeVarargs`는 메서드나 생성자의 구현이 varargs 매개변수와 관련해 unsafe한 동작을 하지 않는다는 **프로그래머의 주장**입니다. 런타임 검사를 추가하거나 위험한 구현을 자동으로 수정하지 않습니다.

Java SE 25에서 variable-arity constructor와 `static`, `final`, `private` varargs method 등에 사용할 수 있지만, "붙일 수 있다"는 문법 조건과 "실제로 안전하다"는 의미는 구분해야 합니다.

### 배열 alias를 통한 쓰기와 외부 노출을 특히 조심한다

안전성 주장을 깨뜨리기 쉬운 대표적인 경우는 다음과 같습니다.

- varargs 배열을 `Object[]` 같은 넓은 배열로 바라본 뒤 호환되지 않는 값을 쓴다.
- varargs 배열 참조를 외부에 노출해 다른 코드가 내용을 바꿀 수 있게 한다.
- unchecked cast 결과를 검증 없이 특정 `T`라고 가정한다.

반대로 varargs 배열에서 값을 읽어 type-safe한 컬렉션이나 다른 연산으로 전달하고, 배열 자체에 위험한 쓰기를 하지 않는 구현은 안전하다고 판단할 수 있습니다.

### varargs가 꼭 필요한 API인지도 확인한다

여러 제네릭 목록을 받는다고 항상 varargs가 필요한 것은 아닙니다.

```java
static <T> void processAll(List<List<T>> lists) {
    // ...
}
```

호출 편의와 API 형태에 따라 선택이 달라지지만, non-reifiable element type과 배열의 경계를 굳이 만들 이유가 없다면 collection 매개변수가 더 단순한 계약이 될 수 있습니다.

이 Concept의 핵심은 annotation 이름을 외우는 것이 아닙니다. **varargs는 배열을 사용하고, 제네릭 타입 인자는 같은 방식으로 런타임에 표현되지 않기 때문에 alias를 통한 잘못된 쓰기가 heap pollution으로 이어질 수 있다**는 흐름을 이해하는 것입니다. `@SafeVarargs`는 그 위험이 없음을 개발자가 책임지고 선언하는 도구입니다.
