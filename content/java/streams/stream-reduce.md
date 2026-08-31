---
kind: concept
contentKey: java.core.streams.stream-reduce
topicContentKey: java.core.streams
slug: stream-reduce
title: "Stream reduce"
summary: "identity와 associativity를 지키고 reduction 도구를 선택한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html"
    title: "Java SE 25 API: Stream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: reduce overload·identity·combiner 계약 확인
---
# Stream reduce

## 쉬운 진입

여러 값을 하나로 합치는 합계·최댓값·문자열 결합은 reduction이다. `reduce`는 합치는
operation이 중간 결과를 다시 받아도 같은 규칙을 적용할 수 있어야 하며, 병렬로 조각을
합쳐도 결과가 일관되어야 한다.

## 정확한 메커니즘

identity는 아무 값과 합쳐도 그 값의 역할을 해야 한다. 덧셈에는 0, 곱셈에는 1이 맞다.
combiner와 accumulator는 결합법칙(associativity)을 만족해야 한다. `-`처럼 순서에 의존하는
연산에 잘못된 identity를 주면 순차 실행에서는 우연히 보이고 병렬·분할에서 깨질 수 있다.

```java
int total = List.of(1, 2, 3).stream().reduce(0, Integer::sum); // 6
```

결과가 collection이나 map이면 직접 mutable container를 reduce하기보다 collector가 의도를
더 정확히 표현한다. empty stream에서 identity가 없는 overload는 `Optional`을 반환한다.

## 실전·면접 연결

reduce는 단순한 loop를 함수형으로 바꾸는 장식이 아니다. identity, accumulator, combiner의
타입과 결합 규칙을 보고 sequential/parallel 모두의 의미를 검토한다. 문자열 대량 결합은
`joining`, grouping은 collector가 더 읽기 쉽다.

## 흔한 오해

- identity를 “첫 번째 원소”로 두는 것은 아니다.
- reduce가 자동으로 순서를 보존하는 문자열 builder를 만들어 주지 않는다.
- 순차 stream에서 맞았다는 사실이 병렬 분할에서도 맞음을 보장하지 않는다.
