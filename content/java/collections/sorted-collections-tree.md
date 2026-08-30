---
kind: concept
contentKey: java.core.collections.sorted-collections-tree
topicContentKey: java.core.collections
slug: sorted-collections-tree
title: "TreeSet·TreeMap과 정렬 계약"
summary: "정렬 컬렉션의 비교 기준과 compareTo 0의 집합 의미를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html"
    title: "TreeSet API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: sorted set과 comparator 일관성 권고 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeMap.html"
    title: "TreeMap API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 정렬 Map의 key 비교 계약 확인
---
# TreeSet·TreeMap과 정렬 계약

## 쉬운 진입

항상 이름순으로 꺼내야 하는 명단은 삽입 후 매번 정렬하는 대신 TreeSet이 정렬된 집합을
유지하게 할 수 있다. 대신 “같은 원소인가”를 비교 결과가 함께 결정한다.

## 정확한 메커니즘

TreeSet과 TreeMap은 자연 순서 또는 Comparator를 사용한다. 비교 결과가 0이면 Set에서는
동일 원소로 취급하고 Map에서는 같은 key로 취급할 수 있다. 그래서 compareTo/Comparator가
equals와 일관되지 않으면 HashSet과 TreeSet의 크기가 달라질 수 있다.

```java
Set<String> byLength = new TreeSet<>(Comparator.comparingInt(String::length));
byLength.add("cat");
byLength.add("dog"); // 길이만 비교하면 이미 같은 원소로 판단될 수 있음
```

## 실전·면접 연결

길이 우선처럼 동률이 많은 정렬은 `thenComparing`으로 안정적인 tie-breaker를 추가한다.
정렬된 결과만 필요하면 List 정렬이 더 단순하고, 범위 조회가 핵심일 때 Tree 구조를 선택한다.

## 흔한 오해

- TreeSet이 equals만 사용해 중복을 판정한다고 보면 안 된다.
- 정렬된 컬렉션은 비교 기준이 바뀐 뒤 원소를 수정하면 질서가 깨질 수 있다.
- TreeSet의 정렬은 HashSet의 iteration 정렬 버전과 같은 의미가 아니다.
