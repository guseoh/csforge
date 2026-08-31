---
kind: concept
contentKey: java.core.streams.parallel-stream-tradeoffs
topicContentKey: java.core.streams
slug: parallel-stream-tradeoffs
title: "Parallel stream trade-offs"
summary: "병렬 stream의 분할 가능성·연산 비용·공유 상태와 측정의 trade-off를 판단한다"
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html"
    title: "Java SE 25 API: java.util.stream package"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: parallel stream 계약과 non-interference 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html"
    title: "Java SE 25 API: Stream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 순서·parallel 관련 terminal semantics 확인
---
# Parallel stream trade-offs

## 쉬운 진입

`.parallel()`은 한 줄로 병렬 실행을 요청하지만 자동 성능 향상 버튼은 아니다. 데이터가 작거나
각 작업이 매우 가벼우면 분할·병합 비용이 더 크고, 공유 상태나 순서 의존성이 있으면 correctness
문제가 먼저 생긴다.

## 정확한 메커니즘

parallel stream은 source를 여러 부분으로 처리할 수 있다는 실행 모델을 사용한다. collector와
reduction은 부분 결과를 합칠 수 있는 계약이 필요하고, side effect는 thread-safe하더라도
원하는 논리적 순서를 보장하지 않을 수 있다. 어떤 thread pool을 사용하고 어떻게 분할하는지는
Java API 계약과 특정 JDK/runtime 구현 세부를 구분해 말해야 한다.

```text
source -> split -> [part A] [part B] [part C]
                         \   |   /
                      combine/reduce
```

## 실전·면접 연결

CPU-bound이고 충분히 큰 독립 작업인지, collector가 병합 가능한지, latency와 ordering 요구가
무엇인지 측정한다. blocking I/O를 parallel stream에 넣는 것은 thread 자원 고갈을 만들 수
있다. common pool에 대한 세부 운영 정책은 애플리케이션 전체 workload와 함께 검토한다.

## 흔한 오해

- parallel stream이 모든 terminal operation을 더 빠르게 한다는 보장은 없다.
- `forEachOrdered`는 순서 관찰을 강제하지만 병렬 비용을 없애지 않는다.
- JDK 한 버전의 worker thread 수나 분할 알고리즘을 Java 언어 보장처럼 문서화하면 안 된다.
