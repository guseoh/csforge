---
kind: concept
contentKey: java.core.collections.immutable-unmodifiable-collections
topicContentKey: java.core.collections
slug: immutable-unmodifiable-collections
title: "불변 컬렉션과 unmodifiable view"
summary: "원본을 반영하는 unmodifiable view와 구조를 고정한 snapshot을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)"
    title: "Java SE 25 List.copyOf API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: null 불허와 unmodifiable 결과 및 인스턴스 재사용 계약 확인
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
source.add("B"); // view는 [A, B], snapshot은 [A]
```

view의 mutating method는 UnsupportedOperationException을 내지만 source mutation은 관찰한다.
`List.copyOf`는 null 원소를 허용하지 않는 unmodifiable List를 반환하며 이후 원본의 구조
변경을 반영하지 않는다. 적합한 unmodifiable List를 입력하면 같은 인스턴스를 재사용할 수도
있으므로 항상 새 객체를 만든다는 보장은 없다. 원소 참조는 공유되며 원소가 mutable이면
그 내부 상태 변경은 snapshot에서도 보일 수 있다. 이는 깊은 복사나 완전한 불변 객체가 아니다.

## 실전·면접 연결

생성자에서 입력을 복사하고 getter에서 unmodifiable view/snapshot을 반환하면 객체의 컬렉션
소유권이 명확해진다. 큰 데이터나 잦은 변경에서는 매번 복사하는 비용과 API 안전성의 균형을
정한다.

## 흔한 오해

- 원본 구조 변경을 반영하는 view와 구조 변경에서 분리된 snapshot은 다르다.
- unmodifiable List 안의 mutable object까지 자동으로 불변이 되지 않는다.
- `List.of`와 `List.copyOf`는 null을 허용하지 않는다.
