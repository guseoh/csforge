---
kind: concept
contentKey: java.core.generics.generic-types-methods
topicContentKey: java.core.generics
slug: generic-types-methods
title: "제네릭 타입과 제네릭 메서드"
summary: "타입을 매개변수처럼 받아 여러 타입에 재사용하면서 컴파일 시점 타입 안전성을 얻는 제네릭의 기본 구조를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5"
    title: "JLS 4.5 Parameterized Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 매개변수화 타입의 언어 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.4"
    title: "JLS 8.4.4 Generic Methods"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 제네릭 메서드 규칙 확인
---
# 제네릭 타입과 제네릭 메서드

같은 자료구조나 로직을 여러 타입에 재사용하고 싶다고 해서 모든 값을 `Object`로 받으면 호출할 때마다 형변환이 필요하고, 잘못된 타입을 넣어도 컴파일러가 충분히 막아 주지 못합니다. **제네릭(generics)** 은 사용할 타입을 매개변수처럼 표현해 재사용성과 타입 안전성을 함께 얻는 기능입니다.

### Object만 사용하면 타입 정보가 사라진다

```java
class Box {
    private Object value;

    void set(Object value) {
        this.value = value;
    }

    Object get() {
        return value;
    }
}
```

문자열 상자라고 생각하고 사용해도 다른 타입을 넣는 것을 막을 수 없습니다.

```java
Box box = new Box();
box.set("java");
box.set(10); // 컴파일 가능

String value = (String) box.get(); // 실행 중 실패 가능
```

제네릭 타입을 사용하면 상자를 만들 때 어떤 타입을 담을지 정할 수 있습니다.

```java
class Box<T> {
    private T value;

    void set(T value) {
        this.value = value;
    }

    T get() {
        return value;
    }
}

Box<String> box = new Box<>();
box.set("java");
// box.set(10); // 컴파일 오류
String value = box.get();
```

`T`는 실제 객체가 아니라 **타입 매개변수(type parameter)** 입니다. `Box<String>`처럼 사용할 때 `T`가 어떤 타입으로 취급될지 정해집니다.

### 제네릭 메서드는 메서드만 독립적으로 타입을 받을 수 있다

클래스 전체가 제네릭일 필요 없이 특정 메서드만 타입 매개변수를 가질 수도 있습니다.

```java
static <T> T first(List<T> values) {
    return values.getFirst();
}
```

```java
String name = first(List.of("kim", "lee"));
Integer number = first(List.of(1, 2, 3));
```

호출 문맥과 인자로부터 컴파일러가 `T`를 추론할 수 있어 대부분 타입 인자를 직접 적지 않아도 됩니다.

### 제네릭의 핵심은 컴파일 시점 검증이다

제네릭을 사용한다고 런타임에 모든 타입 정보가 그대로 유지되는 것은 아닙니다. Java 제네릭은 타입 소거(type erasure)라는 규칙과 함께 동작합니다. 하지만 코드를 컴파일할 때는 `List<String>`에 `Integer`를 넣는 식의 오류를 막고 불필요한 cast를 줄여 줍니다.

즉 다음 두 질문을 나눠야 합니다.

1. 컴파일러가 어떤 타입 사용을 허용하는가?
2. 런타임에는 어떤 타입 정보가 실제로 남는가?

두 번째 질문은 타입 소거 주제에서 더 깊게 다룹니다.

### 타입 매개변수 이름보다 역할이 중요하다

관례적으로 `T`, `E`, `K`, `V` 같은 짧은 이름을 많이 사용합니다.

- `T`: 일반적인 Type
- `E`: collection의 Element
- `K`, `V`: Map의 Key와 Value

하지만 복잡한 API에서는 의미 있는 이름을 선택할 수도 있습니다. 중요한 것은 제네릭이 “문법을 어렵게 만드는 기능”이 아니라 **타입 관계를 API 계약에 넣는 도구**라는 점입니다.

### 문제를 풀 때 확인할 것

제네릭 코드에서는 먼저 타입 매개변수가 어디에 선언되었는지 봅니다. 클래스의 `T`인지, 메서드가 새로 선언한 `<T>`인지 구분하고, 호출 시 실제 타입이 무엇으로 추론되는지 따라가면 됩니다.

그리고 `List<String>`과 `List<Object>`가 서로 어떤 관계인지까지 자동으로 가정하면 안 됩니다. 이 부분은 제네릭 불공변성에서 이어서 다룹니다.
