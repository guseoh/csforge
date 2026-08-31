---
kind: concept
contentKey: java.core.collections.sorted-collections-tree
topicContentKey: java.core.collections
slug: sorted-collections-tree
title: "TreeSet과 TreeMap의 정렬 기준"
summary: "정렬된 Set·Map에서 Comparable 또는 Comparator가 원소 순서뿐 아니라 key·원소 구분에도 영향을 줄 수 있음을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html"
    title: "Java SE 25 API: TreeSet"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 정렬된 Set 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeMap.html"
    title: "Java SE 25 API: TreeMap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 정렬된 Map 계약 확인
---
# TreeSet과 TreeMap의 정렬 기준

`TreeSet`과 `TreeMap`은 원소 또는 key를 **정렬된 순서로 유지하는 컬렉션**입니다. 자연 순서가 있으면 `Comparable`, 다른 순서가 필요하면 `Comparator`를 사용할 수 있습니다.

```java
Set<String> names = new TreeSet<>();
names.add("lee");
names.add("kim");
```

iteration하면 정렬 기준에 따른 순서로 값을 볼 수 있습니다.

### 정렬 기준은 중복 판단에도 영향을 준다

`TreeSet`은 일반적인 `HashSet`처럼 hashCode로 원소를 구분하는 구조가 아닙니다. 비교 결과가 `0`이면 정렬 관점에서 같은 위치의 원소로 취급합니다.

```java
Comparator<Member> byAge = Comparator.comparingInt(Member::age);
Set<Member> set = new TreeSet<>(byAge);
```

나이는 같지만 id가 다른 두 Member가 있어도 comparator가 나이만 비교해 `0`을 반환하면 하나가 중복처럼 취급될 수 있습니다.

그래서 sorted collection의 ordering이 equals와 일관되지 않을 때 어떤 의미가 생기는지 꼭 확인해야 합니다.

### 범위 조회에 유용한 API가 있다

정렬된 구조를 기반으로 `NavigableSet`, `NavigableMap`은 특정 key보다 크거나 작은 값, 범위 view 등을 찾는 API를 제공합니다.

```java
map.floorEntry(key);
map.ceilingEntry(key);
map.subMap(from, true, to, false);
```

단순히 전체를 정렬해서 출력하는 용도만이 아니라 **순서 기반 검색과 범위 연산**이 요구될 때 유용합니다.

### 내부 tree의 세부를 계약처럼 외우지 않는다

JDK 구현은 self-balancing tree 구조를 사용하지만 정확한 node 배치와 회전 알고리즘을 `SortedMap`의 보장으로 생각하면 안 됩니다. Java 컬렉션 학습에서는 ordering, log(n) 기본 연산 특성, comparator 계약을 중심으로 이해하고 tree 알고리즘 자체는 DSA 영역에서 다룹니다.

### 선택 기준

정렬이 한 번만 필요하면 `ArrayList`를 모은 뒤 sort하는 편이 단순할 수 있습니다. 삽입·삭제가 계속되는 동안 정렬 상태와 범위 조회가 필요하면 Tree 계열 컬렉션이 자연스러울 수 있습니다.
