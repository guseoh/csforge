---
kind: concept
contentKey: java.core.collections.iterable-iterator-foreach-modification
topicContentKey: java.core.collections
slug: iterable-iterator-foreach-modification
title: "Iterable, Iterator와 순회 중 수정"
summary: "enhanced for가 Iterator 기반 순회와 어떻게 연결되는지 이해하고 순회 중 구조 변경과 fail-fast의 보장 범위를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Iterable.html"
    title: "Java SE 25 API: Iterable"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Iterable 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Iterator.html"
    title: "Java SE 25 API: Iterator"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: next/remove 및 iteration 계약 확인
---
# Iterable, Iterator와 순회 중 수정

다음 enhanced for 문은 간단해 보이지만 Java가 컬렉션 순회를 표현하는 중요한 추상화와 연결됩니다.

```java
for (String value : values) {
    System.out.println(value);
}
```

`Iterable`은 `iterator()`를 제공하고, `Iterator`는 다음 원소가 있는지 확인하고 순서대로 꺼내는 cursor 역할을 합니다.

```java
Iterator<String> iterator = values.iterator();
while (iterator.hasNext()) {
    String value = iterator.next();
}
```

배열의 enhanced for는 별도 규칙을 사용하지만 Iterable 객체 순회는 이런 iterator 개념으로 이해할 수 있습니다.

### 순회 중 컬렉션을 직접 수정하면 왜 문제일까

```java
for (String value : values) {
    if (value.isBlank()) {
        values.remove(value);
    }
}
```

iterator는 현재 순회 상태를 관리하고 있는데 바깥에서 collection 구조가 예상하지 못하게 바뀌면 cursor와 실제 구조의 관계가 깨질 수 있습니다. 많은 일반 컬렉션 iterator는 이런 구조적 변경을 감지해 `ConcurrentModificationException`을 던질 수 있습니다.

다만 **fail-fast는 동시성 안전을 보장하는 완벽한 검출 장치가 아닙니다.** API 문서도 일반적으로 best-effort 진단 성격임을 설명합니다. 예외가 안 났다고 thread-safe하다는 뜻은 아닙니다.

### iterator.remove가 지원된다면 그 경로를 쓴다

```java
Iterator<String> iterator = values.iterator();
while (iterator.hasNext()) {
    if (iterator.next().isBlank()) {
        iterator.remove();
    }
}
```

`Iterator.remove()`는 optional operation입니다. 모든 iterator가 지원하는 것은 아니므로 해당 컬렉션 계약을 확인해야 합니다.

간단한 조건 삭제는 `removeIf`가 의도를 더 잘 드러낼 수도 있습니다.

```java
values.removeIf(String::isBlank);
```

### concurrent collection은 별도 iteration 계약을 가진다

`ConcurrentHashMap` 등 concurrent collection의 iterator는 일반 fail-fast iterator와 다른 일관성 특성을 가질 수 있습니다. 여러 스레드에서 수정하며 순회해야 하는 요구는 concurrent collection의 공식 계약을 확인해야 합니다.

### 문제를 풀 때 확인할 것

- 지금 순회가 index 기반인가 Iterator 기반인가?
- 구조 변경을 collection 자체로 하고 있는가 iterator를 통해 하고 있는가?
- remove가 optional operation인지?
- `ConcurrentModificationException`을 thread-safety 보장으로 오해하고 있지 않은가?

순회 코드는 **누가 cursor를 관리하고 누가 구조를 바꾸는지**를 보면 이해하기 쉽습니다.
