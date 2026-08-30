---
kind: concept
contentKey: java.core.object-model.object-contract
topicContentKey: java.core.object-model
slug: object-contract
title: Object의 equals, hashCode, toString 계약
summary: 값 동등성, 해시 기반 컬렉션, 진단용 문자열의 계약을 지킨다
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html"
    title: Object API
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: equals/hashCode/toString 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html"
    title: HashMap API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 해시 기반 키 사용 조건 확인
---
# Object 계약

`equals`는 두 객체가 논리적으로 같은지 판단하는 계약이고, `hashCode`는 같은 객체로 판단되는 값이 같은 해시 버킷을 찾도록 돕는 계약입니다. `a.equals(b)`가 true라면 반드시 `a.hashCode() == b.hashCode()`여야 합니다. 반대는 필요하지 않아 서로 다른 값이 같은 해시를 가질 수 있습니다.

```java
final class UserId {
    private final String value;
    // equals와 hashCode는 value를 함께 사용해야 한다.
}
```

`HashMap`이나 `HashSet`에 키나 원소로 넣은 객체의 equality 필드가 바뀌면, 객체가 논리적으로는 같아도 기존 버킷에서 찾지 못하는 문제가 생길 수 있습니다. 키는 불변으로 설계하거나 컬렉션에 넣은 뒤 equality를 결정하는 상태를 변경하지 않는 편이 안전합니다.

`toString`은 디버깅과 로그에 유용한 표현을 제공하지만, 직렬화 포맷이나 보안 경계로 사용하면 안 됩니다. 로그에 비밀번호·토큰 같은 민감 정보를 노출하지 않도록 별도로 주의해야 합니다.
