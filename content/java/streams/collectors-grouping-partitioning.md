---
kind: concept
contentKey: java.core.streams.collectors-grouping-partitioning
topicContentKey: java.core.streams
slug: collectors-grouping-partitioning
title: "Collectors grouping and partitioning"
summary: "grouping·partitioning 결과 구조를 외부 mutable state 없이 만든다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html"
    title: "Java SE 25 API: Collectors"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: groupingBy·partitioningBy와 downstream collector 확인
---
# Collectors grouping and partitioning

## 쉬운 진입

학생을 학년별로 모으거나 합격/불합격 두 묶음으로 나누려면 결과 구조가 필요하다.
`groupingBy`는 key별 collection을 만들고 `partitioningBy`는 boolean 조건을 기준으로 두
그룹을 만든다.

## 정확한 메커니즘

```java
Map<String, Long> countByTeam = users.stream()
        .collect(Collectors.groupingBy(User::team, Collectors.counting()));
Map<Boolean, List<User>> pass = users.stream()
        .collect(Collectors.partitioningBy(user -> user.score() >= 60));
```

downstream collector로 `mapping`, `toSet`, `summarizingInt` 등을 조합할 수 있다. collector가
제공하는 결과 map/list의 구현체·순서·동시성 속성은 해당 collector 계약을 확인해야 하며,
외부 map에 `computeIfAbsent`하며 누적하는 방식보다 pipeline의 집계 경계가 명확하다.

## 실전·면접 연결

grouping key의 equality/hashCode가 결과에 직접 영향을 준다. 집계 결과를 API로 노출할 때는
정렬이 필요하면 collector 결과를 원하는 순서로 명시적으로 정리한다. `groupingByConcurrent`는
일반 `groupingBy`와 동시성 및 결과 계약이 다르므로 성능 이름만 보고 교체하지 않는다.

## 흔한 오해

- `partitioningBy`가 빈 그룹을 항상 제거한다는 보장은 없다.
- grouping 결과의 key 순서가 자동으로 입력 순서라는 보장은 없다.
- collector를 쓴다고 원소의 부작용이 자동으로 안전해지는 것은 아니다.
