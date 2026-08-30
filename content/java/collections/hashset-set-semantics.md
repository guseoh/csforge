---
kind: concept
contentKey: java.core.collections.hashset-set-semantics
topicContentKey: java.core.collections
slug: hashset-set-semantics
title: "HashSet과 Set의 동등성"
summary: "HashSet의 중복 판정과 mutable element가 집합을 깨뜨리는 이유를 판단한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashSet.html"
    title: "HashSet API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Set 구현과 hash 기반 중복 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html"
    title: "Set API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 동일 원소 중복 불가 계약 확인
---
# HashSet과 Set의 동등성

## 쉬운 진입

명단에 같은 학생을 두 번 넣지 않으려면 List를 매번 선형 검색하기보다 Set이 “이미 같은
원소가 있는가”를 관리하게 할 수 있다. HashSet에서는 그 기준이 equals/hashCode 계약이다.

## 정확한 메커니즘

`add`는 기존 원소와 동등하다고 판단되면 false를 반환하고 집합을 바꾸지 않는다. `contains`
와 `remove`도 같은 hashing/equality 기준을 사용한다. 따라서 원소를 넣은 뒤 equality에
참여하는 field가 바뀌면 contains/remove가 실패하는 mutable-key 문제를 겪을 수 있다.

```java
Set<String> tags = new HashSet<>();
boolean first = tags.add("java");  // true
boolean second = tags.add(new String("java")); // false
```

## 실전·면접 연결

불변 value object를 원소로 쓰고 equals/hashCode를 함께 재정의한다. 정렬까지 필요하면
HashSet이 아니라 TreeSet과 Comparable/Comparator 계약을 선택한다.

## 흔한 오해

- HashSet의 iteration 순서를 화면 순서로 사용하면 안 된다.
- object identity가 아니라 구현의 equality 계약으로 중복을 판단한다.
- hashCode가 다르면 equals가 true일 수 있다는 구현은 계약 위반이다.
