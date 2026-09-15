---
kind: concept
contentKey: java.core.collections.hashmap-hashing-collision
topicContentKey: java.core.collections
slug: hashmap-hashing-collision
title: "HashMap 조회와 hash 충돌"
summary: "key의 hashCode로 후보 영역을 좁히고 equals로 실제 key를 확인하는 흐름, 충돌과 mutable key 문제를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html"
    title: "Java SE 25 API: HashMap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: HashMap의 key-value 및 성능 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode()"
    title: "Java SE 25 API: Object.hashCode"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: hashCode 계약 확인
  - url: "https://d2.naver.com/helloworld/831311"
    title: "Java HashMap은 어떻게 동작하는가?"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: hash·bucket·collision과 Java HashMap 구현 흐름을 시각적으로 보충
---
# HashMap 조회와 hash 충돌

`HashMap`의 핵심은 key 전체를 처음부터 순서대로 비교하는 대신 **hash 값을 이용해 비교할 후보를 좁히는 것**입니다. hashCode가 key의 유일한 번호는 아니므로 최종적으로는 논리적 동등성도 확인해야 합니다.

![HashMap의 hash·bucket·equals 조회 흐름](/learning/java/hashmap-buckets.svg)

### 조회는 hash와 equality를 함께 사용한다

개념적으로 key 조회는 다음 흐름으로 볼 수 있습니다.

```text
key
 │
 ▼
hashCode 계산
 │
 ▼
후보 위치 결정
 │
 ▼
같은 후보의 key 비교
 │
 ▼
equals로 실제 key 확인
```

OpenJDK의 `HashMap`은 bucket, node, 특정 조건의 tree 같은 구현 기법을 사용합니다. 이런 자료는 현재 구현을 이해하는 데 유용하지만 **`Map` 인터페이스가 영구적으로 그 내부 구조를 보장한다는 뜻은 아닙니다.**

### hash 충돌은 정상적인 상황이다

서로 다른 객체가 같은 hashCode를 반환할 수 있습니다.

```java
!a.equals(b)
a.hashCode() == b.hashCode()
```

이것은 계약 위반이 아닙니다. 같은 후보 영역에 들어오더라도 추가 equality 비교로 서로 다른 key를 구분할 수 있습니다.

반대로 `equals`가 `true`인 두 객체는 같은 hashCode를 반환해야 합니다. 논리적으로 같은 key가 서로 다른 후보 영역으로 가면 `get`이 실제 같은 key를 확인할 기회조차 얻지 못할 수 있기 때문입니다.

### key의 equality 상태를 삽입 뒤 바꾸면 검색 경로가 달라질 수 있다

```java
class Key {
    String value;
    // value를 기준으로 equals/hashCode
}
```

```java
Key key = new Key("kim");
Map<Key, String> map = new HashMap<>();
map.put(key, "value");

key.value = "lee";
```

`value`가 hash와 equality에 참여한다면 저장 당시와 조회 당시의 기준이 달라집니다.

```text
삽입 시: value="kim" → hash A → 후보 A
변경 후: value="lee" → hash B → 후보 B에서 검색
                         └─ 실제 entry는 삽입 당시 위치에 남아 있음
```

`HashMap`은 key 객체 내부의 변경을 감지해 entry를 자동으로 재배치하지 않습니다. 그래서 key identity를 결정하는 상태는 가능하면 불변으로 유지하는 편이 안전합니다.

### 평균적인 빠른 조회와 절대적인 O(1)은 같은 말이 아니다

HashMap의 기본 연산은 hash가 적절히 분산된다는 가정에서 효율적으로 동작하도록 설계되어 있습니다. 하지만 충돌 분포, resize, key의 `hashCode`와 `equals` 비용 등에 따라 실제 비용은 달라집니다.

따라서 "HashMap은 항상 O(1)"이라고 외우기보다 **hash로 후보를 좁힌 뒤 collision이 있으면 추가 비교가 필요하다**는 실행 흐름을 이해하는 편이 정확합니다.

HashMap을 읽을 때는 `hashCode`와 `equals`가 각각 무엇을 담당하는지, 서로 다른 key의 충돌이 허용된다는 점, 그리고 key의 equality 상태가 컬렉션에 있는 동안 안정적인지를 함께 확인하세요. 이 세 가지가 hash 기반 조회의 핵심 계약입니다.
