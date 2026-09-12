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

호출 시 만들어지는 배열의 런타임 component type은 `List[]` 수준이므로 `List<Integer>`를 저장하는 순간에는 generic type argument 차이를 검사하지 못할 수 있습니다. 이후 그 원소를 `List<String>`이라고 믿고 읽는 경계에서 `ClassCastException`이 드러납니다.

```text
List<String>[]처럼 사용하는 varargs 배열
          │ Object[]로 별칭
          ▼
List<Integer> 저장
          │ 배열의 runtime component는 List 수준
          ▼
선언상 List<String>이라고 믿는 참조
          │
          ▼
String 읽기에서 실패
```

컴파일러가 generic varargs 선언이나 호출에서 unchecked 경고를 주는 이유가 이 위험 때문입니다.

### `@SafeVarargs`는 안전하게 만들어 주는 기능이 아니다

```java
@SafeVarargs
static <T> void safeUse(T... values) {
    for (T value : values) {
        consume(value);
    }
}
```

`@SafeVarargs`는 컴파일러에게 “이 메서드 또는 생성자의 구현은 varargs 매개변수와 관련해 잠재적으로 unsafe한 동작을 하지 않는다”고 **프로그래머가 주장하는 annotation**입니다. 런타임 검사를 추가하거나 위험한 구현을 자동 수정하지 않습니다.

Java SE 25에서 annotation을 붙일 수 있다는 문법 조건과 실제 구현이 안전하다는 의미도 구분해야 합니다. variable-arity constructor에는 사용할 수 있고, method라면 override될 수 없는 `static`, `final`, `private` method에 사용할 수 있습니다. 반대로 override 가능한 instance varargs method에 붙이면 compile-time error입니다.

```text
@SafeVarargs 사용 가능성
- constructor
- static varargs method
- final instance varargs method
- private instance varargs method

하지만 "붙일 수 있음" ≠ "구현이 실제로 안전함"
```

공식 JLS가 설명하듯 annotation은 non-reifiable varargs 때문에 생기는 declaration/invocation의 unchecked warning을 억제합니다. `@SuppressWarnings("unchecked")`를 단순히 넓게 붙이는 것과도 영향 범위가 같지 않습니다.

### 무엇을 하면 안전성 주장이 깨질까

다음과 같은 동작은 특히 의심해야 합니다.

- varargs 배열을 `Object[]` 같은 넓은 배열로 보고 호환되지 않는 값을 쓴다.
- varargs 배열 참조를 외부 코드에 노출해 나중에 내용을 바꿀 수 있게 한다.
- unchecked cast로 얻은 값을 실제 검증 없이 특정 `T`라고 가정한다.

반대로 배열에서 값을 읽어 다른 type-safe collection에 전달하는 정도라면 `@SafeVarargs`의 대표적인 안전 사용 사례가 될 수 있습니다.

### collection 매개변수가 더 단순한 API일 수도 있다

여러 제네릭 목록을 받아야 한다고 항상 varargs가 필요한 것은 아닙니다.

```java
static <T> void processAll(List<List<T>> lists) {
    // ...
}
```

호출 편의와 API 형태에 따라 다르지만, 배열과 non-reifiable element type의 경계를 만들 이유가 없다면 collection으로 입력을 표현하는 편이 안전성 설명도 단순할 수 있습니다.

### 안전성을 검토할 때 볼 것

- varargs의 element type은 reifiable한가?
- varargs 배열에 다른 타입의 값을 쓰는가?
- 배열 참조를 외부로 넘겨 다른 코드가 내용을 바꿀 수 있게 하는가?
- 제네릭 배열을 `Object[]`처럼 넓게 바라본 뒤 쓰기를 수행하는가?
- 경고를 단순히 숨기기 위해 `@SafeVarargs`를 붙이고 있지 않은가?

### 면접에서 이렇게 나옵니다

#### Q. `@SafeVarargs`를 붙이면 제네릭 varargs가 안전해지나요?

아닙니다. 이 annotation은 구현이 varargs 매개변수에 대해 unsafe한 동작을 하지 않는다는 프로그래머의 주장입니다. 경고를 억제할 뿐 런타임 타입 검사를 추가하지 않습니다. 따라서 배열을 넓은 타입으로 별칭한 뒤 잘못된 parameterized value를 쓰는 코드에 붙여도 heap pollution과 런타임 오류는 그대로 발생할 수 있습니다.

#### Q. heap pollution은 무엇인가요?

parameterized type으로 선언된 변수가 그 타입 계약과 맞지 않는 객체를 가리키게 된 상태를 말합니다. raw type, unchecked conversion, generic varargs와 배열 alias 같은 경로에서 발생할 수 있으며, 문제는 오염이 생긴 지점보다 나중의 정상적인 typed read에서 `ClassCastException`으로 드러날 수 있다는 점입니다.
