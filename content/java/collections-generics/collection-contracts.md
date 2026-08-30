---
kind: concept
contentKey: java.core.collections-generics.collection-contracts
topicContentKey: java.core.collections-generics
slug: collection-contracts
title: List, Set, Map의 계약과 선택
summary: 순서·중복·키 조회라는 요구를 기준으로 컬렉션을 선택한다
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html"
    title: List API
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 순서 있는 컬렉션의 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html"
    title: Set API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 중복 없는 컬렉션의 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html"
    title: Map API
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: key-value 조회 계약 확인
---
# 컬렉션의 계약부터 선택하기

`List`는 순서와 위치 기반 접근을 제공하고 중복을 허용합니다. `Set`은 같은 원소의 중복을 허용하지 않는 계약을 제공하며, 구현에 따라 순서 보장이 달라집니다. `Map`은 키와 값의 대응을 표현하고 키의 유일성을 사용합니다. 어떤 구현이 빠른지보다 먼저 업무 요구가 어떤 계약을 필요로 하는지 정해야 합니다.

```java
List<String> executionOrder = new ArrayList<>();
Set<String> uniqueTags = new HashSet<>();
Map<Long, User> usersById = new HashMap<>();
```

`HashSet`과 `HashMap`은 일반적으로 해시를 이용하지만 평균 성능과 최악의 경우, 순서, 동등성 계약을 함께 고려해야 합니다. 삽입 순서가 필요하면 `LinkedHashSet`/`LinkedHashMap`, 정렬된 키가 필요하면 `TreeSet`/`TreeMap`처럼 요구를 직접 표현하는 구현을 고릅니다.

컬렉션을 API에서 반환할 때는 호출자가 변경할 수 있는지, null을 허용하는지, 순서가 계약인지도 명확히 해야 합니다. 구현 클래스를 무조건 노출하기보다 필요한 인터페이스와 불변성의 범위를 먼저 결정하는 것이 안전합니다.
