---
kind: concept
contentKey: java.core.generics.type-erasure-reifiable-types
topicContentKey: java.core.generics
slug: type-erasure-reifiable-types
title: "타입 소거와 런타임에 남는 타입 정보"
summary: "Java 제네릭 타입 정보가 컴파일 후 모두 같은 방식으로 남지 않는 이유와 reifiable type, 제네릭 배열 등 실질적 제약을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6"
    title: "JLS 4.6 Type Erasure"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 타입 소거 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.7"
    title: "JLS 4.7 Reifiable Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 런타임에 완전히 표현 가능한 타입 범주 확인
---
# 타입 소거와 런타임에 남는 타입 정보

`List<String>`과 `List<Integer>`는 컴파일 시점에는 분명히 다른 타입으로 검사됩니다. 하지만 런타임에 다음 검사를 할 수는 없습니다.

```java
// if (value instanceof List<String>) { } // 허용되지 않음
```

Java 제네릭은 **타입 소거(type erasure)** 를 사용하기 때문에 매개변수화 타입의 타입 인자 정보가 런타임 객체의 완전한 타입으로 그대로 유지되는 것은 아닙니다.

### 컴파일러가 제네릭 타입 관계를 먼저 검사한다

```java
List<String> names = new ArrayList<>();
names.add("java");
String name = names.getFirst();
```

컴파일러는 `String`만 넣고 읽도록 검사합니다. 컴파일 뒤에는 소거된 타입을 기준으로 필요한 cast나 bridge method가 삽입될 수 있습니다.

그렇다고 "제네릭 정보가 런타임에 전부 사라진다"고 단순화해서도 안 됩니다. class file의 `Signature` 같은 metadata에는 일부 generic 선언 정보가 남을 수 있고 reflection으로 이를 읽을 수 있습니다.

중요한 구분은 다음입니다.

```text
컴파일 시점
List<String>과 List<Integer>를 다른 매개변수화 타입으로 검사

런타임 객체 타입
각 List 인스턴스가 String/Integer 타입 인자를
서로 다른 런타임 클래스처럼 완전히 보유하지는 않음

선언 metadata
일부 generic 선언 정보가 class file에 남을 수 있음
```

### reifiable type은 런타임에서 타입을 충분히 표현할 수 있다

런타임에서 타입을 완전히 표현할 수 있는 범주의 타입을 **reifiable type**이라고 합니다. 일반 클래스와 raw type, unbounded wildcard를 사용하는 일부 타입 등이 여기에 포함됩니다.

반면 `List<String>` 같은 구체 매개변수화 타입은 일반적으로 reifiable하지 않습니다. 그래서 런타임 타입 정보가 필요한 다음 연산에는 제약이 생깁니다.

```java
// value instanceof List<String>
// new List<String>[10]
```

`new T()`도 일반적인 제네릭 타입 매개변수만으로는 만들 수 없습니다. 이 문장들은 세부 이유가 완전히 같지는 않지만, 공통적으로 **런타임에서 소거된 타입 인자를 일반 클래스 타입처럼 사용할 수 없다는 제약**과 연결됩니다.

### 배열과 제네릭은 런타임 타입 모델이 다르다

배열은 런타임 component type을 알고 저장할 때 타입을 검사합니다. 반면 제네릭 타입 인자는 같은 방식으로 런타임 component type이 되지 않습니다.

그래서 `new List<String>[10]` 같은 배열 생성을 허용하면 배열의 runtime store check와 제네릭의 소거 모델이 충돌할 수 있습니다. 이 차이는 다음 generic varargs Concept에서 heap pollution 문제로 다시 이어집니다.

### reflection metadata와 객체 자체의 타입 정보는 구분해야 한다

```java
Field field = MyClass.class.getDeclaredField("names");
Type type = field.getGenericType();
```

선언된 필드가 `List<String>`이라는 metadata를 읽을 수 있는 경우가 있습니다. 하지만 이것은 임의의 `ArrayList` 인스턴스가 런타임에 자신의 원소 타입 `String`을 완전하게 보유한다는 뜻이 아닙니다.

```java
Object value = new ArrayList<Integer>();

System.out.println(value instanceof List<?>); // 가능
// System.out.println(value instanceof List<String>); // 불가능
```

`List<?>`에서는 런타임에 List라는 사실만 검사합니다. 원소 타입 인자가 `String`인지까지 같은 방식으로 확인하는 것은 아닙니다.

### 런타임에 타입 정보가 필요하다면 별도 값으로 전달할 수 있다

제네릭 `T`의 실제 런타임 타입이 꼭 필요한 API라면 `Class<T>` 같은 type token을 전달하는 설계를 사용할 수 있습니다.

```java
static <T> T[] newArray(Class<T> type, int length) {
    @SuppressWarnings("unchecked")
    T[] result = (T[]) Array.newInstance(type, length);
    return result;
}
```

이 경우 reflection이 타입 소거를 되돌린 것이 아닙니다. **호출자가 런타임에 필요한 타입 정보를 별도 값으로 제공한 것**입니다.

타입 소거를 볼 때는 항상 "이 정보가 컴파일 시점에 필요한가, 런타임에 필요한가"를 먼저 구분하세요. 그리고 reflection으로 읽는 선언 metadata와 각 객체가 실제로 보유한 런타임 타입 정보를 같은 것으로 취급하지 않는 것이 핵심입니다.
