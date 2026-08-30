---
kind: concept
contentKey: java.core.modern-java.stream-lazy-terminal
topicContentKey: java.core.modern-java
slug: stream-lazy-terminal
title: Stream 파이프라인과 지연 평가
summary: intermediate operation과 terminal operation의 역할과 실행 시점을 이해한다
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html"
    title: Stream API
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: stream 파이프라인과 종료 연산 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html"
    title: java.util.stream API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 지연성과 파이프라인 개념 확인
---
# Stream 파이프라인

Stream은 컬렉션 자체가 아니라 요소를 처리하는 파이프라인입니다. `filter`, `map`, `limit` 같은 intermediate operation은 새 stream을 만들고 보통 지연(lazy)됩니다. `toList`, `count`, `findFirst`, `forEach` 같은 terminal operation이 실행되어야 필요한 계산이 수행됩니다.

```java
List<String> names = users.stream()
        .filter(User::active)
        .map(User::name)
        .limit(10)
        .toList();
```

중간 연산을 선언했다고 부수 효과가 즉시 발생한다고 생각하면 안 됩니다. 또한 stream은 일반적으로 한 번 소비하면 재사용할 수 없습니다. `findFirst`처럼 short-circuit하는 종료 연산은 필요한 만큼만 요소를 처리할 수 있지만, 병렬 stream과 순서·부수 효과의 관계는 별도로 검토해야 합니다.

Stream은 데이터를 자동으로 병렬화하거나 원본 컬렉션을 변경하지 않습니다. 가독성, 디버깅, 예외 처리, 성능을 비교해 단순 반복문이 더 명확한 경우에는 반복문을 선택해도 됩니다.
