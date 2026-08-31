---
kind: concept
contentKey: java.core.streams.stream-pipeline-laziness
topicContentKey: java.core.streams
slug: stream-pipeline-laziness
title: "Stream pipeline laziness"
summary: "source·intermediate·terminal operation과 지연 실행·short-circuit를 설명한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html"
    title: "Java SE 25 API: Stream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: pipeline, lazy operation, terminal operation 확인
---
# Stream pipeline laziness

## 쉬운 진입

Stream는 collection에 저장된 결과가 아니라 “어떻게 흘려보낼지”를 표현하는 pipeline이다.
`filter`와 `map`만 적어 둔 뒤에는 아직 순회가 일어나지 않고, `count`, `toList`, `findFirst`
같은 terminal operation이 있어야 실제 traversal이 시작된다.

## 정확한 메커니즘

```text
source ── filter ── map ── findFirst
  선언만 함                 여기서 traversal 시작
```

중간 연산은 새로운 stream을 반환하고 lazy하다. `findFirst`, `anyMatch`, `limit`처럼 결과가
결정되면 더 읽지 않는 short-circuit terminal이 있다. 한 stream은 한 번 terminal operation에
소비되므로 같은 객체를 다시 terminal에 넘길 수 없다.

## 실전·면접 연결

pipeline을 만들고도 terminal을 빠뜨리는 버그가 흔하다. `peek`를 디버깅용 side effect나
비즈니스 로직으로 의존하지 말고, 비용이 큰 map 앞에 filter를 두는 것처럼 pipeline의 의미와
실행량을 함께 읽는다. 실제 평가 순서는 병렬 여부와 stateful operation에 따라 단순한 “모든
filter가 먼저” 모델과 다를 수 있다.

## 흔한 오해

- `stream()` 호출만으로 collection이 즉시 순회되는 것은 아니다.
- intermediate operation을 여러 번 연결해도 원본 collection이 자동 변경되지 않는다.
- stream은 collection처럼 저장된 결과를 재사용하는 객체가 아니다.
