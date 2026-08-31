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

제네릭이 불공변이기 때문에 `List<Integer>`를 `List<Number>`로 바로 넘길 수 없습니다. 하지만 어떤 메서드는 값을 추가할 필요 없이 **여러 하위 타입 컬렉션에서 읽기만** 하면 됩니다. 반대로 여러 하위 타입 값을 **넓은 상위 타입 컬렉션에 넣기만** 하는 경우도 있습니다.

Wildcard는 이런 사용 방향을 API 계약에 표현합니다.

### 값을 생산해 주는 쪽이면 `? extends`

```java
static double sum(List<? extends Number> values) {
    double total = 0;
    for (Number value : values) {
        total += value.doubleValue();
    }
    return total;
}
```

이 메서드는 다음을 모두 받을 수 있습니다.

```java
sum(List.of(1, 2, 3));          // List<Integer>
sum(List.of(1.5, 2.5));        // List<Double>
```

원소 타입이 정확히 `Integer`인지 `Double`인지 몰라도 적어도 `Number`의 하위 타입이라는 사실은 알기 때문에 `Number`로 읽을 수 있습니다.

하지만 어떤 구체 타입인지 모르므로 일반적으로 새 값을 안전하게 추가할 수 없습니다.

```java
// values.add(Integer.valueOf(1)); // 실제 List<Double>일 수도 있음
```

### 값을 소비하는 쪽이면 `? super`

```java
static void addDefaults(List<? super Integer> values) {
    values.add(1);
    values.add(2);
}
```

`List<Integer>`, `List<Number>`, `List<Object>` 모두 `Integer` 값을 받아들일 수 있으므로 안전합니다.

반대로 꺼낼 때는 구체적인 상위 타입을 확정할 수 없어서 `Object` 수준으로만 안전하게 읽을 수 있습니다.

### PECS는 외우는 구호보다 데이터 흐름이다

흔히 **PECS: Producer Extends, Consumer Super**라고 외웁니다.

- API 입장에서 컬렉션이 값을 **제공(produce)** 하면 `? extends T`
- API가 컬렉션에 값을 **넣어 소비(consume)** 하게 하면 `? super T`

하지만 한 컬렉션에서 복잡하게 읽고 쓰는 경우에는 wildcard보다 타입 매개변수를 다시 설계하는 편이 더 자연스러울 수 있습니다. PECS를 모든 제네릭 선언에 기계적으로 붙이는 규칙으로 사용하면 안 됩니다.

### `List<?>`는 무엇을 뜻할까

```java
void inspect(List<?> values) {
    Object first = values.getFirst();
}
```

`?`는 원소 타입을 모른다는 뜻입니다. 모든 참조 타입은 `Object`이므로 `Object`로 읽을 수 있지만, `null` 외의 구체 값을 안전하게 추가할 수는 없습니다.

### 문제를 풀 때는 읽기와 쓰기를 따로 본다

| 선언                     | 안전하게 읽기 | 안전하게 쓰기                |
| ------------------------ | ------------- | ---------------------------- |
| `List<? extends Number>` | `Number`      | 일반적인 Number 값 추가 불가 |
| `List<? super Integer>`  | `Object`      | `Integer` 가능               |
| `List<?>`                | `Object`      | 일반적인 값 추가 불가        |

실제 API를 설계할 때는 “이 매개변수에서 값을 꺼내 쓰는가, 값을 넣는가?”를 먼저 그려 보면 wildcard 방향이 훨씬 쉽게 보입니다.
