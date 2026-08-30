---
kind: concept
contentKey: java.core.collections-generics.hashmap-hashing
topicContentKey: java.core.collections-generics
slug: hashmap-hashing
title: HashMap 조회와 equals/hashCode의 관계
summary: 해시 버킷 조회, 충돌, 키 계약을 이해해 map을 안전하게 사용한다
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html"
    title: HashMap API
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 해시 기반 map의 동작과 복잡도 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html"
    title: Object API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: equals/hashCode 일반 계약 확인
---
# HashMap은 어떻게 키를 찾는가

`HashMap`은 키의 해시를 사용해 후보 버킷을 찾고, 후보 안에서 `equals`로 실제 키가 같은지 확인합니다. 해시가 다르면 같은 키일 수 없다고 판단하고, 해시가 같아도 서로 다른 키일 수 있으므로 equals 확인이 필요합니다. 충돌은 정상적으로 가능한 상황이며 구현은 이를 처리합니다.

평균적으로 조회·삽입이 상수 시간에 가깝다는 설명은 균일한 해시와 적절한 분포를 전제로 한 기대치입니다. 키가 `null`인지, 동등성 필드가 변하지 않는지, 동시 접근이 필요한지까지 함께 살펴야 합니다. 일반 `HashMap`은 여러 스레드의 동시 변경을 위한 동기화 컨테이너가 아닙니다.

```java
record UserKey(long tenantId, long userId) {}
Map<UserKey, User> users = new HashMap<>();
```

불변 record처럼 equality에 쓰이는 값이 안정적인 키는 map의 의미와 잘 맞습니다. 가변 키를 삽입한 뒤 필드를 바꾸면 새 상태의 해시 버킷에서 이전 항목을 찾지 못할 수 있습니다.
