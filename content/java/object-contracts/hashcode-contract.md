---
kind: concept
contentKey: java.core.object-contracts.hashcode-contract
topicContentKey: java.core.object-contracts
slug: hashcode-contract
title: "hashCode와 equals의 계약"
summary: "논리적으로 같은 객체는 같은 hashCode를 반환해야 하는 이유와 hash 기반 컬렉션에서 계약 위반이 만드는 문제를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode()"
    title: "Java SE 25 API: Object.hashCode"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: hashCode 공식 계약 확인
---
# hashCode와 equals의 계약

`hashCode`는 객체를 하나의 정수 값으로 표현하는 메서드입니다. 중요한 점은 hashCode가 **객체의 유일한 번호**가 아니라는 것입니다. 서로 다른 객체가 같은 hashCode를 가질 수 있고, 이를 충돌(collision)이라고 합니다.

hash 기반 컬렉션은 보통 hashCode로 후보 위치를 좁힌 뒤 equals로 실제 동등성을 확인합니다.

```text
key
 │
 ▼
hashCode 계산
 │
 ▼
후보 영역 선택
 │
 ├─ 후보 1 ─ equals 확인
 └─ 후보 2 ─ equals 확인
```

구체적인 bucket 구조나 tree 변환 같은 세부는 `HashMap` 구현 주제에서 다룹니다. 여기서는 객체가 제공해야 하는 계약이 핵심입니다.

### 같은 객체라면 같은 hashCode가 필요하다

가장 중요한 규칙은 다음입니다.

> `a.equals(b)`가 `true`라면 `a.hashCode() == b.hashCode()`여야 한다.

반대는 성립하지 않습니다. hashCode가 같다고 두 객체가 equals일 필요는 없습니다.

```java
if (a.equals(b)) {
    // 반드시 같은 hashCode
}
```

이 규칙을 깨면 `HashSet`이나 `HashMap`이 논리적으로 같은 객체를 다른 후보 영역에서 찾으려 하면서 조회에 실패할 수 있습니다.

### equals만 override하면 왜 문제가 될까

```java
class Money {
    private final long amount;

    @Override
    public boolean equals(Object o) {
        return o instanceof Money other && amount == other.amount;
    }
}
```

논리적으로 같은 `Money(1000)` 두 개가 만들어져도 `hashCode`를 적절히 override하지 않으면 `Object`의 기본 hashCode와 equals 기준이 맞지 않을 수 있습니다.

```java
Set<Money> values = new HashSet<>();
values.add(new Money(1000));

boolean found = values.contains(new Money(1000));
```

`equals`와 `hashCode`가 같은 상태를 기준으로 일관되게 구현되어야 `found`를 기대대로 판단할 수 있습니다.

### mutable key는 특히 위험하다

```java
class Key {
    String value;

    @Override
    public int hashCode() {
        return value.hashCode();
    }
}
```

이 객체를 `HashMap` key로 넣은 뒤 `value`를 바꾸면 hashCode가 달라질 수 있습니다. 컬렉션은 원래 hash를 기준으로 저장 위치를 정했는데 조회할 때 다른 hash를 계산하게 되어 key를 찾지 못하는 문제가 생길 수 있습니다.

그래서 hash key에 사용되는 equality 관련 상태는 가능하면 불변으로 만드는 편이 안전합니다.

### 좋은 hashCode가 꼭 완벽한 분포를 뜻하지는 않는다

계약은 equals인 객체가 같은 hashCode를 반환하는 것을 요구합니다. 서로 다른 객체를 얼마나 고르게 분산시키는지는 성능 품질과 관련된 별도 문제입니다. 모든 객체에 같은 hashCode를 반환해도 계약 자체는 지킬 수 있지만 hash 기반 컬렉션의 성능은 나빠질 수 있습니다.

### 문제를 풀 때 확인할 것

- equals인 두 객체의 hashCode가 같은가?
- hashCode가 같은데 equals는 false일 수 있다는 점을 기억했는가?
- key를 넣은 뒤 equality/hash에 사용되는 상태가 바뀌는가?
- HashMap 내부 구현과 Object 계약을 같은 것으로 설명하고 있지 않은가?

이 네 가지가 핵심입니다.
