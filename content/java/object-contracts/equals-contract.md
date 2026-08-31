---
kind: concept
contentKey: java.core.object-contracts.equals-contract
topicContentKey: java.core.object-contracts
slug: equals-contract
title: "equals contract"
summary: "논리적 동등성의 다섯 계약과 상속에서의 대칭성 문제를 판단한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html"
    title: "Java SE 25 Object API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: equals method contract 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: inheritance와 method overriding의 언어 규칙 확인
---
# equals contract

## 쉬운 진입

주문 번호가 같은 두 객체를 같은 주문으로 취급할지, 아니면 서로 다른 생성 기록으로 취급할지는
`==`만으로 결정되지 않는다. collection과 서비스가 믿을 수 있는 논리적 동등성 규칙을 먼저
정해야 한다.

## 정확한 메커니즘

`Object.equals` 계약은 reflexive(자기 자신과 같다), symmetric(서로 같은 결과), transitive
(연쇄 가능), consistent(관련 상태가 바뀌지 않으면 반복 결과가 같다), null에 대해 false라는
조건을 요구한다. equality에 포함할 field는 business identity와 수명 정책에 따라 정해야 한다.

```java
public boolean equals(Object other) {
    if (this == other) return true;
    if (!(other instanceof User user)) return false;
    return id == user.id;
}
```

상속에서 superclass가 `instanceof`로 넓게 비교하고 subclass가 추가 field를 비교하면
대칭성이나 transitivity가 깨질 수 있다. `getClass()` 비교는 다른 subtype과의 equality를
막지만 프록시·상속 정책과 함께 선택해야 한다.

## 실전·면접 연결

주문 번호로 같은 주문을 판단하는 객체와 좌표로 같은 값을 판단하는 객체는 논리적 동등성
기준이 다르다. subtype 대체 가능성과 equality에 쓰는 상태의 변경 시점을 검토한다.
`equals`가 true라고 모든 field가 같거나 동일한 객체 참조라는 뜻은 아니다. 값에서 계산한
캐시처럼 의미상 부수적인 필드는 같은 값의 판단 기준에 자동으로 포함하지 않는다.

## 흔한 오해

- `==`는 reference type의 논리적 equality가 아니라 같은 object identity를 비교한다.
- `equals`를 override했다고 상속 hierarchy의 모든 subtype과 자동으로 대칭이 되지 않는다.
- `equals`의 일부 field를 바꿔도 언제나 안전하다고 가정하지 않는다. collection key라면 특히 위험하다.
