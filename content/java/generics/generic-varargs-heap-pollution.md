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
---
# 제네릭 varargs와 heap pollution

varargs는 호출할 때 여러 인자를 편하게 넘기게 해 주지만 내부적으로 배열과 연결됩니다.

```java
static void print(String... values) { }
```

제네릭의 타입 인자는 런타임에 완전히 reifiable하지 않을 수 있고, 배열은 런타임 원소 타입을 검사합니다. 이 둘이 만나면 컴파일러가 타입 안전성을 완전히 보장하기 어려운 경우가 생깁니다.

### 제네릭 varargs에서 경고가 나는 이유

```java
static <T> void process(List<T>... lists) {
    // ...
}
```

`List<T>`는 일반적으로 reifiable type이 아닙니다. 그런데 varargs를 표현하려면 배열 형태가 필요합니다. 이런 경계에서 잘못된 참조가 섞이면 변수의 선언 타입과 실제 들어 있는 객체 타입이 어긋날 수 있습니다. 이를 **heap pollution**이라고 합니다.

예를 들어 배열 공변성을 통해 다른 매개변수화 타입을 끼워 넣는 식의 위험한 코드가 가능해질 수 있습니다.

```java
static void unsafe(List<String>... lists) {
    Object[] array = lists;
    array[0] = List.of(42);

    String value = lists[0].getFirst(); // 런타임 실패 가능
}
```

컴파일러가 generic varargs 선언이나 호출에서 unchecked 경고를 주는 이유가 이 위험 때문입니다.

### `@SafeVarargs`는 안전하게 만들어 주는 기능이 아니다

```java
@SafeVarargs
static <T> void safeUse(T... values) {
    // 배열에 잘못된 타입을 쓰거나 외부로 위험하게 노출하지 않음
}
```

`@SafeVarargs`는 컴파일러에게 “이 메서드 구현은 varargs 매개변수에 대해 타입 안전성을 깨는 동작을 하지 않는다”고 프로그래머가 약속하는 애너테이션입니다. 위험한 구현에 붙인다고 안전해지지 않습니다.

또 아무 메서드에나 붙일 수 있는 것도 아닙니다. 실제 override 가능성과 관련된 적용 제한이 있으므로 공식 API의 허용 대상 조건을 따라야 합니다.

### 안전성을 검토할 때 볼 것

- varargs 배열에 다른 타입의 값을 쓰는가?
- 배열 참조를 외부로 넘겨 다른 코드가 내용을 바꿀 수 있게 하는가?
- 제네릭 배열을 `Object[]`처럼 넓게 바라본 뒤 쓰기를 수행하는가?
- 경고를 단순히 숨기기 위해 `@SafeVarargs`를 붙이고 있지 않은가?

실무에서는 제네릭 varargs가 꼭 필요하지 않다면 `List<T>` 같은 명시적인 컬렉션 매개변수가 더 단순한 API가 될 수도 있습니다.
