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
---
# HashMap 조회와 hash 충돌

`HashMap`의 장점은 key 전체를 처음부터 순서대로 비교하지 않고 **hash 값을 이용해 비교할 후보를 좁힐 수 있다는 점**입니다. 다만 hashCode가 곧 key의 유일한 번호는 아니므로 마지막에는 equality 확인이 필요합니다.

### 조회 흐름을 단계로 나눈다

개념적으로 key 조회를 다음처럼 이해할 수 있습니다.

```text
key
 │
 ▼
hashCode 계산
 │
 ▼
내부에서 후보 위치 결정
 │
 ▼
같은 후보의 key들과 비교
 │
 ▼
equals로 실제 key 확인
```

OpenJDK의 `HashMap`은 bucket, node, 특정 조건의 tree 구조 같은 구현 기법을 사용하지만 **그 세부가 `Map` 인터페이스의 언어 보장인 것은 아닙니다.** 문제에서 API 계약과 JDK 구현 설명을 구분해야 합니다.

### hash 충돌은 정상적으로 발생할 수 있다

서로 다른 객체가 같은 hashCode를 반환할 수 있습니다.

```java
!a.equals(b)
a.hashCode() == b.hashCode()
```

이 상태는 계약 위반이 아닙니다. HashMap은 같은 후보 위치에서 추가 비교를 통해 key를 구분해야 합니다. 좋은 hash 분포는 평균 성능에 도움을 주지만 충돌 자체를 완전히 없애는 것이 hashCode 계약은 아닙니다.

### equals와 hashCode가 함께 중요한 이유

논리적으로 같은 key라면 같은 hashCode를 반환해야 합니다. 그렇지 않으면 같은 key를 다른 후보 위치에서 찾으려 하여 조회가 실패할 수 있습니다.

```java
Map<MemberKey, String> map = new HashMap<>();
map.put(new MemberKey(1L), "kim");

map.get(new MemberKey(1L));
```

`MemberKey`의 equals/hashCode가 같은 id를 기준으로 일관되게 구현되어야 기대대로 찾을 수 있습니다.

### key를 넣은 뒤 hash 관련 상태를 바꾸면 위험하다

```java
class Key {
    String value;
    // value를 기준으로 equals/hashCode
}
```

Map에 key를 넣은 뒤 `value`를 바꾸면 조회 시 계산되는 hash나 equals 결과가 저장 당시와 달라질 수 있습니다. 그러면 Map 안에 객체가 존재하는데도 현재 key로 찾기 어려운 상황이 생깁니다.

그래서 HashMap key에 사용하는 동등성 관련 상태는 가능하면 불변으로 유지하는 편이 안전합니다.

### O(1)을 절대 시간으로 이해하지 않는다

HashMap의 기본 연산은 hash가 적절히 분산된다는 가정 아래 평균적으로 매우 효율적입니다. 하지만 데이터 수, 충돌 분포, resize, key의 hashCode/equals 비용 등에 따라 실제 비용은 달라집니다.

“HashMap은 항상 O(1)”이라는 한 문장보다 **hash로 후보를 좁히고 충돌 시 비교가 더 필요하다**는 흐름을 이해하는 것이 실무와 면접 모두에 도움이 됩니다.
