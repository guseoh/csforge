---
kind: concept
contentKey: java.core.streams.stream-map-filter-flatmap
topicContentKey: java.core.streams
slug: stream-map-filter-flatmap
title: "Stream map, filter, and flatMap"
summary: "one-to-one·zero-or-one·one-to-many shape 변화를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html"
    title: "Java SE 25 API: Stream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: map·filter·flatMap 동작 확인
---
# Stream map, filter, and flatMap

## 쉬운 진입

`map`은 각 원소를 하나의 다른 값으로 바꾸고, `filter`는 통과하지 못한 원소를 버린다.
각 학생의 과목 목록처럼 원소마다 여러 값이 있다면 `map`만 쓰면 stream 안에 stream이
생긴다. `flatMap`은 그 중첩을 한 흐름으로 펼친다.

## 정확한 메커니즘

```java
List<List<String>> names = List.of(List.of("a", "b"), List.of("c"));
List<String> result = names.stream()
        .flatMap(List::stream)
        .map(String::toUpperCase)
        .filter(name -> name.length() == 1)
        .toList(); // [A, B, C]
```

shape를 `T -> R`, `T -> boolean`, `T -> Stream<R>`로 구분하면 결과 타입을 예측할 수 있다.
`flatMap` mapper가 반환하는 stream의 빈 흐름은 해당 입력이 결과에 아무것도 내지 않는
것으로 이해한다.

## 실전·면접 연결

`flatMap`은 nested collection을 정규화하는 데 유용하지만, null을 자동으로 건너뛰는 연산은
아니다. 입력 계약이 null을 허용한다면 `Stream.empty()` 등 명시적인 정책을 둔다. map 안에서
외부 상태를 변경하기보다 변환 결과를 반환하면 pipeline reasoning이 쉬워진다.

## 흔한 오해

- `filter`는 원소를 다른 타입으로 변환하지 않는다.
- `map`은 자동으로 중첩 stream을 flatten하지 않는다.
- `flatMap`은 모든 null을 무시한다는 보장이 없다.
