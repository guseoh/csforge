---
kind: concept
contentKey: java.core.collections.list-set-map-contracts
topicContentKey: java.core.collections
slug: list-set-map-contracts
title: "List, Set, Map을 요구사항으로 선택하기"
summary: "순서·중복·포함 여부·key-value 조회 요구를 기준으로 List, Set, Map의 계약을 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html"
    title: "Java SE 25 API: List"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: List 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html"
    title: "Java SE 25 API: Set"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Set 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html"
    title: "Java SE 25 API: Map"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: Map 계약과 keySet/values/entrySet view 확인
---
# List, Set, Map을 요구사항으로 선택하기

컬렉션을 고를 때 `ArrayList가 빠르다`, `HashMap이 O(1)이다` 같은 구현 이야기부터 시작하면 실제 요구를 놓치기 쉽습니다. 먼저 **데이터를 어떤 규칙으로 다뤄야 하는가**를 봐야 합니다.

### 순서와 중복이 의미 있으면 List

`List`는 원소의 순서를 가지며 같은 값이 여러 번 들어갈 수 있습니다.

```java
List<String> history = List.of("LOGIN", "SEARCH", "SEARCH");
```

두 번의 `SEARCH`가 실제 두 번 발생한 사건이라면 중복을 없애면 안 됩니다. index로 특정 위치를 조회해야 하는 요구도 List와 잘 맞습니다.

### 중복 없는 membership이 핵심이면 Set

`Set`은 같은 원소를 중복해서 보관하지 않는 집합 계약을 제공합니다.

```java
Set<String> roles = new HashSet<>();
roles.add("ADMIN");
roles.add("ADMIN");
```

중복을 무엇으로 판단하는지는 구현과 원소의 계약에 따라 달라질 수 있습니다. `HashSet`에서는 `equals`와 `hashCode`, `TreeSet`에서는 정렬 기준이 특히 중요합니다.

또 `Set`이라는 타입만으로 정렬 순서나 삽입 순서가 보장되는 것은 아닙니다. 순서가 필요하다면 구체 구현의 계약을 따로 확인해야 합니다.

### key로 값을 찾는다면 Map

```java
Map<Long, Member> membersById = new HashMap<>();
membersById.put(1L, member);
Member found = membersById.get(1L);
```

`Map`은 key와 value의 대응 관계를 표현합니다. key는 중복될 수 없고 같은 key로 다시 `put`하면 기존 mapping의 value가 교체될 수 있습니다.

`Map`은 `Collection`의 하위 인터페이스가 아니라 별도의 key-value 추상화입니다. 따라서 단순한 "값의 모음"이 아니라 key, value, entry라는 세 관점으로 사용할 수 있습니다.

### Map의 collection view는 원본과 연결될 수 있다

`keySet()`, `values()`, `entrySet()`은 별도 snapshot이 아니라 backing Map과 연결된 view를 제공합니다.

```java
Map<String, Integer> map = new HashMap<>();
map.put("A", 1);
map.put("B", 2);

Set<String> keys = map.keySet();
keys.remove("A");

System.out.println(map.containsKey("A")); // false
```

`keys.remove("A")`는 view만 바꾸는 것이 아니라 backing Map의 mapping도 제거합니다. 반대로 Map이 바뀌면 이미 얻어 둔 view에서도 그 변화를 볼 수 있습니다.

```text
Map
 ├─ keySet()  ─┐
 ├─ values()   ├─ backing mapping을 바라보는 view
 └─ entrySet() ┘
```

그래서 collection을 API 밖으로 전달할 때는 타입 이름만 보고 독립된 값 모음이라고 가정하지 말고 **snapshot인지 live view인지**를 확인해야 합니다.

### 같은 데이터도 필요한 연산에 따라 다른 컬렉션으로 볼 수 있다

주문을 화면 순서대로 보여 주려면 `List<Order>`가 자연스럽고, 이미 처리한 주문 ID의 포함 여부를 자주 확인하려면 `Set<Long>`이 자연스럽습니다. ID로 주문을 찾아야 한다면 `Map<Long, Order>`가 맞습니다.

즉 데이터 종류가 같다고 항상 같은 컬렉션을 써야 하는 것은 아닙니다. **어떤 연산을 표현하려는가**가 먼저이고, 그다음에 `ArrayList`, `HashSet`, `TreeMap` 같은 구현의 성능과 세부 특성을 비교합니다.

컬렉션을 선택할 때는 중복이 의미 있는지, 순서나 위치가 필요한지, membership이 핵심인지, key 기반 조회가 필요한지를 먼저 정하세요. 이 순서를 지키면 구현체의 성능 특성을 실제 요구와 연결해서 판단하기 쉬워집니다.
