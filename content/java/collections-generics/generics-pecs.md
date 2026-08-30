---
kind: concept
contentKey: java.core.collections-generics.generics-pecs
topicContentKey: java.core.collections-generics
slug: generics-pecs
title: 제네릭 불공변성과 PECS
summary: 타입 안전성을 지키면서 생산자·소비자 컬렉션을 API에 표현한다
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 제네릭 타입과 와일드카드 규칙 확인
  - url: "https://docs.oracle.com/javase/tutorial/java/generics/wildcards.html"
    title: Wildcards (The Java Tutorials)
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: upper/lower bounded wildcard와 PECS 예시 확인
---
# 제네릭과 PECS

Java 제네릭은 기본적으로 불공변(invariant)입니다. `List<Integer>`는 `List<Number>`의 하위 타입이 아닙니다. 만약 이것이 허용되면 `List<Integer>`에 `Double`을 넣는 타입 안전성 문제가 생깁니다.

와일드카드는 읽기와 쓰기의 경계를 표현합니다. `? extends T`는 T의 생산자(producer)로 읽을 때 사용할 수 있지만 일반적인 T 추가는 허용되지 않습니다. `? super T`는 T를 소비(consumer)하는 컬렉션으로 T를 안전하게 추가할 수 있고, 꺼낸 값은 Object 수준으로만 확실히 알 수 있습니다.

```java
static double sum(List<? extends Number> numbers) {
    return numbers.stream().mapToDouble(Number::doubleValue).sum();
}

static void addDefaults(List<? super Integer> target) {
    target.add(0);
}
```

PECS(Producer Extends, Consumer Super)는 API의 방향을 판단하는 기억 장치일 뿐 모든 와일드카드를 기계적으로 붙이라는 뜻은 아닙니다. 타입 매개변수 자체가 더 명확하거나 컬렉션을 반환해 소유권을 넘기는 편이 낫다면 그 선택을 합니다.
