---
kind: concept
contentKey: java.core.generics.wildcards-pecs
topicContentKey: java.core.generics
slug: wildcards-pecs
title: "Wildcard와 PECS"
summary: "생산자는 extends, 소비자는 super라는 경계를 읽고 쓸 수 있는 타입을 판단한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1"
    title: "Java Language Specification 4.5.1장: Type Arguments"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: wildcard와 type argument 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html#copy(java.util.List,java.util.List)"
    title: "Collections.copy API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: extends/super가 함께 쓰이는 생산·소비 API 확인
---
# Wildcard와 PECS

## 쉬운 진입

목록에서 읽기만 할 때는 “어떤 하위 타입 목록이든” 받을 수 있고, 넣기만 할 때는 “어떤
상위 타입 목록”을 안전하게 준비할 수 있다. 이 방향을 PECS(Producer Extends, Consumer Super)로
기억하면 wildcard를 목적에 맞게 읽을 수 있다.

## 정확한 메커니즘

```java
static double sum(List<? extends Number> values) {
    return values.stream().mapToDouble(Number::doubleValue).sum();
}

static void addDefaults(List<? super Integer> target) {
    target.add(0);
}
```

`? extends Number`에서 꺼내면 Number로 읽을 수 있지만 특정 하위 타입을 안전하게 넣을 수
없다(null 제외). `? super Integer`에는 Integer를 넣을 수 있지만 꺼낼 때는 Object 수준으로
읽는다. 정확한 한 타입이 필요하고 읽기·쓰기를 모두 해야 하면 named type parameter가 맞다.

## 실전·면접 연결

API 매개변수에서 wildcard는 허용 범위를 표현하고, 반환 타입에는 호출자가 다룰 구체 타입을
알 수 있도록 과도한 wildcard를 피한다. PECS는 암기보다 메서드가 컬렉션을 생산하는지
소비하는지 확인하는 도구다.

## 흔한 오해

- `List<? extends Number>`에 `Integer`를 넣을 수 있다고 보장되지 않는다. 실제 목록은 Double일 수 있다.
- `? super Integer`에서 꺼낸 값이 Integer라고 단정할 수 없다.
- wildcard와 `Object`는 같은 의미가 아니다.
