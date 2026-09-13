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

`HashMap`의 장점은 key 전체를 처음부터 순서대로 비교하지 않고 **hash 값을 이용해 비교할 후보를 좁힐 수 있다는 점**입니다. 다만 hashCode가 곧 key의 유일한 번호는 아니므로 마지막에는 equality 확인이 필요합니다.

![HashMap의 hash·bucket·equals 조회 흐름](/learning/java/hashmap-buckets.svg)

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

반대로 hashCode가 같다고 두 객체가 반드시 equals여야 하는 것은 아닙니다. hashCode는 후보를 좁히는 정보이고, collision은 정상적으로 처리 가능한 상황입니다.

### key를 넣은 뒤 hash 관련 상태를 바꾸면 위험하다

```java
class Key {
    String value;
    // value를 기준으로 equals/hashCode
}
```

Map에 key를 넣은 뒤 `value`를 바꾸면 조회 시 계산되는 hash나 equals 결과가 저장 당시와 달라질 수 있습니다. 그러면 Map 안에 객체가 존재하는데도 현재 key로 찾기 어려운 상황이 생깁니다.

```text
삽입 시: value="kim" → hash A → bucket A
변경 후: value="lee" → hash B → bucket B에서 검색
                         └─ 실제 entry는 여전히 bucket A 쪽
```

HashMap이 key 객체의 필드 변경을 감지해서 entry를 자동 이동시키지는 않습니다. 그래서 HashMap key에 사용하는 동등성 관련 상태는 가능하면 불변으로 유지하는 편이 안전합니다.

### O(1)을 절대 시간으로 이해하지 않는다

HashMap의 기본 연산은 hash가 적절히 분산된다는 가정 아래 평균적으로 매우 효율적입니다. 하지만 데이터 수, 충돌 분포, resize, key의 hashCode/equals 비용 등에 따라 실제 비용은 달라집니다.

“HashMap은 항상 O(1)”이라는 한 문장보다 **hash로 후보를 좁히고 충돌 시 비교가 더 필요하다**는 흐름을 이해하는 것이 실무와 실전 설명 모두에 도움이 됩니다.

### 구현 세부는 현재 JDK를 이해하는 자료로 사용한다

NAVER D2의 HashMap 자료처럼 bucket collision과 tree 전환을 그림으로 살펴보면 현재 구현을 이해하는 데 도움이 됩니다. 다만 특정 threshold나 내부 node 형태를 `Map` 또는 Java 언어의 영구 계약으로 외우지는 않습니다. 이런 값은 OpenJDK 구현과 버전에 속하는 세부사항입니다.

### 면접에서 이렇게 나옵니다

#### Q. HashMap에서 `hashCode()`와 `equals()`가 왜 둘 다 필요한가요?

`hashCode()`는 전체 key를 모두 비교하지 않고 후보 영역을 좁히는 데 사용되고, 같은 후보 안에서 실제로 같은 논리적 key인지 확인하는 데 `equals()`가 필요합니다. 서로 다른 객체의 hashCode가 같을 수 있으므로 hash 값만으로 동일 key를 확정할 수는 없습니다.

#### Q. HashMap의 key는 왜 불변 객체가 안전한가요?

key를 넣은 뒤 `equals`와 `hashCode`에 참여하는 상태가 바뀌면 저장 당시와 조회 당시의 검색 경로가 달라질 수 있습니다. HashMap은 key 내부 상태 변화를 관찰해 entry를 재배치하지 않기 때문에 `get`, `remove`가 예상대로 동작하지 않을 수 있습니다. 그래서 key의 identity를 결정하는 상태는 불변으로 유지하는 것이 안전합니다.
