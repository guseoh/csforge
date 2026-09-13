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

중복 판단 방식은 구현과 원소의 equality 계약에 영향을 받습니다. `HashSet`은 `equals`/`hashCode`, `TreeSet`은 ordering 기준이 특히 중요합니다.

Set을 사용했다고 정렬 순서나 삽입 순서가 자동으로 보장되는 것은 아닙니다. 필요한 순서가 있다면 해당 구현의 계약을 따로 확인해야 합니다.

### key로 값을 찾는다면 Map

```java
Map<Long, Member> membersById = new HashMap<>();
membersById.put(1L, member);
Member found = membersById.get(1L);
```

`Map`은 key와 value의 대응 관계를 표현합니다. key는 중복될 수 없고 같은 key로 다시 `put`하면 기존 mapping의 value가 교체될 수 있습니다.

`Map`은 `Collection`의 하위 인터페이스가 아니라 별도의 key-value 추상화입니다. List나 Set처럼 “원소 한 종류의 모음”으로만 보면 `key`, `value`, `entry`라는 세 가지 관점을 놓치기 쉽습니다.

### Map의 keySet, values, entrySet은 원본과 연결된 view다

`Map`에서 얻는 `keySet()`, `values()`, `entrySet()`은 보통 별도의 snapshot 복사본이 아니라 **backing Map과 연결된 view**입니다.

```java
Map<String, Integer> map = new HashMap<>();
map.put("A", 1);
map.put("B", 2);

Set<String> keys = map.keySet();
keys.remove("A");

System.out.println(map.containsKey("A")); // false
```

`keys.remove("A")`는 key view만 바꾸는 것이 아니라 backing Map의 해당 mapping도 제거합니다. 반대로 Map에 새로운 key를 추가하면 기존에 얻어 둔 `keySet` view에서도 그 변경을 볼 수 있습니다.

```text
Map
 ├─ keySet()  ─┐
 ├─ values()   ├─ 같은 backing mapping을 바라보는 view
 └─ entrySet() ┘
```

따라서 collection을 API 밖으로 노출할 때는 “Set 타입이니까 독립된 값 모음이겠지”라고 가정하지 말고 **snapshot인지 live view인지**를 계약으로 확인해야 합니다.

### 같은 데이터를 다른 관점으로 볼 수도 있다

주문 목록을 화면 순서대로 보여 주려면 `List<Order>`가 자연스럽고, 이미 처리한 주문 ID를 빠르게 membership 확인하려면 `Set<Long>`이 자연스러울 수 있습니다. 주문 ID로 객체를 찾는 lookup 구조가 필요하면 `Map<Long, Order>`가 맞습니다.

즉 도메인 데이터 종류가 하나라고 컬렉션도 하나만 써야 하는 것은 아닙니다. **어떤 연산을 표현하려는지**가 선택 기준입니다.

### 문제를 풀 때 먼저 물을 것

- 중복이 의미 있는가?
- 원소의 순서나 위치가 필요한가?
- “포함되어 있는가?”가 핵심인가?
- key를 통해 값을 찾아야 하는가?
- 정렬된 순서가 필요한가?
- 반환된 collection이 독립 snapshot인가, backing data와 연결된 view인가?

이 요구를 먼저 정한 뒤 `ArrayList`, `HashSet`, `TreeMap` 같은 구현체의 성능과 세부 특성을 비교해야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. List, Set, Map을 어떻게 구분해서 선택하나요?

구현체 이름보다 먼저 데이터 계약을 봅니다. 순서와 중복을 유지해야 하면 List, 같은 값이 여러 번 있을 의미가 없고 membership이 중요하면 Set, key로 value를 찾는 관계라면 Map이 자연스럽습니다. 그다음에야 정렬, 동시성, 조회 패턴과 성능 요구를 보고 구체 구현을 고릅니다.

#### Q. `map.keySet()`은 Map과 무관한 별도 Set인가요?

아닙니다. `keySet()`은 backing Map과 연결된 view입니다. view를 통해 key를 제거하면 Map의 mapping도 제거되고, Map이 바뀌면 view에서도 그 변화가 보일 수 있습니다. 독립 snapshot이 필요하면 별도로 복사해야 합니다.
