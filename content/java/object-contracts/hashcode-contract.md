---
kind: concept
contentKey: java.core.object-contracts.hashcode-contract
topicContentKey: java.core.object-contracts
slug: hashcode-contract
title: "hashCode contract"
summary: "equals와 hashCode의 일관성과 mutable hash key의 실패 경로를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html"
    title: "Java SE 25 Object API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: equals와 hashCode 일관성 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html"
    title: "HashMap API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: hash 기반 map key 사용 계약 확인
---
# hashCode contract

## 쉬운 진입

`HashMap`은 key를 넣을 때와 찾을 때 같은 위치를 빠르게 계산한다. key가 map에 들어간 뒤
그 위치를 계산하는 field를 바꾸면, map 안에는 object가 남아 있는데 새 위치에서는 찾지
못하는 일이 생긴다.

## 정확한 메커니즘

`equals`가 true인 두 object는 같은 hash code를 가져야 한다. 반대로 hash code가 같다고
`equals`가 true인 것은 아니다. hash code는 후보 영역을 좁히는 값이고 최종 equality는
`equals`로 확인한다.

```java
record AccountKey(String tenant, long number) {}

Map<AccountKey, String> accounts = new HashMap<>();
accounts.put(new AccountKey("kr", 7), "Mina");
```

key에 사용하는 equality field를 insertion 후 변경하면 lookup, remove, containsKey가
기대와 다르게 동작할 수 있다. `record`는 component 기반 equality/hashCode를 제공하지만
component 자체가 mutable이면 소유권 문제는 여전히 남는다.

## 실전·면접 연결

hash code 계산은 충돌을 허용해야 하며, 충돌을 없애는 것이 구현 목표가 아니다. equality에
사용하는 동등성 규칙에 hash 계산을 맞추고, map/set에 넣은 동안 key를 immutable하게
유지한다. 고성능을 이유로 `hashCode`가 매번 다른 값을 내도록 만들면 collection 계약을
깨뜨린다.

hashCode가 equals에 쓰는 모든 필드를 반드시 포함해야 하는 것은 아니다. 일부만 사용해도
같은 값이 같은 hash를 가지면 필수 계약은 만족하지만 충돌이 늘어 성능에 불리할 수 있다.
반대로 equals가 무시하는 가변 필드를 hash에 넣으면 동등한 객체의 hash가 달라질 수 있다.

## 흔한 오해

- 서로 다른 object는 hash code가 반드시 달라야 하는 것이 아니다.
- hash collision이 곧 데이터 덮어쓰기나 equality 성공을 뜻하지 않는다.
- `final` reference만 붙였다고 참조된 key object의 논리 상태까지 immutable해지는 것은 아니다.
