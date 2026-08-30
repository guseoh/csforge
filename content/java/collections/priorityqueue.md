---
kind: concept
contentKey: java.core.collections.priorityqueue
topicContentKey: java.core.collections
slug: priorityqueue
title: "PriorityQueue와 우선순위 처리"
summary: "전체 정렬이 아니라 최소·최대 우선 원소를 반복 추출하는 자료 구조를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html"
    title: "PriorityQueue API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: heap 기반 우선순위 큐와 iterator 비정렬 특성 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html"
    title: "Comparator API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 우선순위 비교 정책 확인
---
# PriorityQueue와 우선순위 처리

## 쉬운 진입

응급도가 높은 작업부터 처리하려면 도착 순서만 기억하는 Queue가 부족하다. PriorityQueue는
매번 가장 우선인 원소를 꺼내는 데 집중한다.

## 정확한 메커니즘

```text
add(5), add(1), add(3) -> heap
poll() -> 1, poll() -> 3, poll() -> 5
```

자연 순서나 Comparator로 우선순위를 정하며 `peek/poll`은 최소 원소(비교 기준상 앞선 원소)를
본다. 내부 배열 전체가 정렬된 것은 아니므로 iterator 순회가 정렬 결과를 보장하지 않는다.
동률의 제거 순서도 별도 tie-breaker 없이는 제품 계약으로 삼지 않는다.

## 실전·면접 연결

최솟값 반복 추출, 작업 스케줄, top-K에 적합하다. 모든 원소를 정렬해 화면에 보여주는 목적이면
정렬된 List가 명확하며, 비교기가 mutable priority를 참조하면 heap 질서가 깨질 수 있다.

## 흔한 오해

- PriorityQueue의 iterator는 우선순위 순서가 아니다.
- `poll()`이 항상 삽입 순서의 첫 원소를 주는 것은 아니다.
- comparator의 작은 값이 높은 우선순위인지 도메인 의미를 확인해야 한다.
