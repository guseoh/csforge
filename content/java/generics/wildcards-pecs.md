---
kind: concept
contentKey: java.core.generics.wildcards-pecs
topicContentKey: java.core.generics
slug: wildcards-pecs
title: "Wildcard와 PECS"
summary: "제네릭 API가 값을 주로 읽는지 쓰는지에 따라 extends와 super 경계를 선택하고 PECS를 실제 데이터 흐름으로 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1"
    title: "JLS 4.5.1 Type Arguments of Parameterized Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: wildcard와 bounded type argument 규칙 확인
---
# Wildcard와 PECS

제네릭은 기본적으로 불공변이기 때문에 `List<Integer>`를 `List<Number>`로 바로 넘길 수 없습니다. 하지만 어떤 API는 값을 추가할 필요 없이 여러 하위 타입 컬렉션에서 **읽기만** 하면 되고, 어떤 API는 특정 타입의 값을 더 넓은 상위 타입 컬렉션에 **쓰기만** 하면 됩니다.

Wildcard는 이런 데이터 흐름을 타입 계약에 표현합니다.

![Wildcard와 PECS의 읽기·쓰기 방향](/learning/java/generics-pecs.svg)

### 값을 제공하는 쪽이면 `? extends`

```java
static double sum(List<? extends Number> values) {
    double total = 0;
    for (Number value : values) {
        total += value.doubleValue();
    }
    return total;
}
```

이 메서드는 `List<Integer>`와 `List<Double>`을 모두 받을 수 있습니다. 원소의 정확한 구체 타입은 몰라도 적어도 `Number`의 하위 타입이라는 사실은 알기 때문에 `Number`로 읽을 수 있습니다.

반면 새 값을 넣을 때는 실제 리스트가 `List<Integer>`인지 `List<Double>`인지 알 수 없습니다.

```java
// values.add(Integer.valueOf(1)); // 실제로 List<Double>일 수도 있음
```

그래서 `extends`를 단순히 "읽기 전용 컬렉션"이라고 외우는 것은 정확하지 않습니다. `clear()`처럼 구체 원소 타입을 몰라도 가능한 구조 변경은 존재할 수 있습니다. 핵심은 **구체적인 `T` 값을 안전하게 써 넣을 수 있느냐**입니다.

### 값을 받아들이는 쪽이면 `? super`

```java
static void addDefaults(List<? super Integer> values) {
    values.add(1);
    values.add(2);
}
```

`List<Integer>`, `List<Number>`, `List<Object>`는 모두 `Integer`를 받을 수 있으므로 안전합니다.

반대로 꺼낼 때는 실제 리스트의 원소 타입이 어느 상위 타입인지 알 수 없으므로 정적으로는 `Object` 수준으로만 안전하게 읽을 수 있습니다.

### PECS는 데이터 흐름을 기억하기 위한 규칙이다

흔히 **PECS: Producer Extends, Consumer Super**라고 정리합니다.

- API가 컬렉션에서 `T` 값을 받아 **읽는 source**로 사용하면 `? extends T`
- API가 컬렉션에 `T` 값을 **쓰는 destination**으로 사용하면 `? super T`

source에서 destination으로 복사하는 API를 보면 두 방향이 한 번에 드러납니다.

```java
static <T> void copy(
        List<? extends T> source,
        List<? super T> destination
) {
    for (T value : source) {
        destination.add(value);
    }
}
```

```text
source                    destination
? extends T                  ? super T
    │                            ▲
    └────── T를 읽음 ────────────┘
                   T를 씀
```

PECS는 모든 제네릭 선언에 기계적으로 붙이는 공식이 아닙니다. 한 컬렉션에서 복잡하게 읽고 쓰며 같은 구체 타입 관계를 유지해야 한다면 wildcard보다 named type parameter가 더 자연스러울 수도 있습니다.

### `List<?>`는 raw List와 다르다

```java
void inspect(List<?> values) {
    Object first = values.getFirst();
}
```

`?`는 원소 타입을 모른다는 사실을 타입 시스템 안에 유지합니다. 따라서 `Object`로 읽을 수 있지만 `null` 외의 구체 값을 안전하게 추가할 수 없습니다.

raw `List`는 제네릭 검사를 일부 우회하므로 의미가 다릅니다. `List<?>`는 타입을 모르는 상태도 **타입 안전하게 표현**합니다.

Wildcard 문제에서는 `extends`와 `super` 이름부터 외우기보다 해당 매개변수에서 **값이 어느 방향으로 흐르는지** 먼저 그리세요. 읽기 source인지 쓰기 destination인지가 보이면 왜 그 bound가 필요한지도 자연스럽게 따라옵니다.
