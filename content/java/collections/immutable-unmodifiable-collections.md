---
kind: concept
contentKey: java.core.collections.immutable-unmodifiable-collections
topicContentKey: java.core.collections
slug: immutable-unmodifiable-collections
title: "불변 컬렉션과 unmodifiable view"
summary: "수정 불가 view와 진짜 불변 복사의 차이, 소유권 전달을 설계한다"
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)"
    title: "Java SE 25 List.copyOf API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: null 불허 copy와 불변 결과 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html#unmodifiableList(java.util.List)"
    title: "Java SE 25 Collections.unmodifiableList API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 원본을 바라보는 unmodifiable view 계약 확인
---
# 불변 컬렉션과 unmodifiable view

## 쉬운 진입

`unmodifiableList`는 “이 손잡이로는 수정하지 마”라는 view이고, 원본 자체가 바뀌지 않는다는
뜻은 아니다. 외부에 소유권을 넘기지 않으려면 snapshot 복사가 필요하다.

## 정확한 메커니즘

```java
List<String> source = new ArrayList<>(List.of("A"));
List<String> view = Collections.unmodifiableList(source);
List<String> snapshot = List.copyOf(source);
source.add("B"); // view에는 보일 수 있지만 snapshot에는 없음
```

view의 mutating method는 UnsupportedOperationException을 내지만 source mutation은 관찰한다.
`List.copyOf`는 null을 허용하지 않는 불변 결과를 만들고 이후 원본 변경을 관찰하지 않는다.
원소 자체가 mutable이면 컬렉션 불변성만으로 원소 상태까지 보호되지는 않는다.

## 실전·면접 연결

생성자에서 입력을 복사하고 getter에서 불변 view/snapshot을 반환하면 aggregate의 컬렉션
소유권이 명확해진다. 큰 데이터나 잦은 변경에서는 매번 복사하는 비용과 API 안전성의 균형을
정한다.

## 흔한 오해

- unmodifiable view는 immutable snapshot과 다르다.
- 불변 컬렉션 안의 mutable object까지 자동으로 불변이 되지 않는다.
- `List.of`와 `List.copyOf`는 null을 허용하지 않는다.
