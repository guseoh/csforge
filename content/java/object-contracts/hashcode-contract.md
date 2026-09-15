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
  - url: "https://tecoble.techcourse.co.kr/post/2020-07-29-equals-and-hashCode/"
    title: "equals와 hashCode는 왜 같이 재정의해야 할까?"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: hash 기반 컬렉션에서 equals와 hashCode 계약이 함께 필요한 이유를 한국어 예제로 복습
---
# hashCode와 equals의 계약

`hashCode()`는 객체에 대한 `int` 값을 반환하지만, 그 값을 객체의 유일한 번호나 영구 식별자로 보면 안 됩니다. 서로 다른 객체도 같은 hashCode를 가질 수 있습니다. 이런 경우를 **충돌(collision)** 이라고 합니다.

hash 기반 컬렉션은 hashCode를 이용해 탐색 범위를 좁힌 뒤 필요하면 `equals`로 실제 동등성을 확인합니다.

```text
key
 │
 ▼
hashCode 계산
 │
 ▼
후보 범위 선택
 │
 ▼
equals로 논리적 동등성 확인
```

구체적인 `HashMap`의 버킷 구조나 충돌 처리 방식은 컬렉션 Topic에서 다룹니다. 여기서는 객체가 제공해야 하는 계약에 집중합니다.

## equals가 true라면 hashCode도 같아야 한다

가장 중요한 규칙은 다음입니다.

```text
a.equals(b) == true
        ↓
a.hashCode() == b.hashCode() 이어야 함
```

반대 방향은 성립하지 않습니다. 두 객체의 hashCode가 같아도 `equals`는 `false`일 수 있습니다.

```java
final class Money {
    private final long amount;

    @Override
    public boolean equals(Object other) {
        return other instanceof Money money
                && amount == money.amount;
    }

    @Override
    public int hashCode() {
        return Long.hashCode(amount);
    }
}
```

`Money`의 논리적 동등성을 `amount`로 정의했다면 hashCode도 그 동등성 의미와 모순되지 않아야 합니다. 그렇지 않으면 저장할 때와 조회할 때 서로 다른 후보 영역을 보게 되어 논리적으로 같은 키를 찾지 못할 수 있습니다.

## 계약을 지키는 것과 좋은 hash 분포는 다른 문제다

`equals`가 여러 필드를 비교한다고 해서 hashCode가 반드시 동일한 필드 개수를 사용해야 하는 것은 아닙니다. 필수 계약은 **equals가 true인 모든 경우 같은 hashCode가 나와야 한다**는 것입니다.

예를 들어 항상 같은 상수를 반환해도 이 방향의 계약은 지킬 수 있습니다. 하지만 모든 객체가 같은 hash에 몰리므로 hash 기반 자료구조의 성능상 장점을 크게 잃습니다.

따라서 두 문제를 구분해야 합니다.

- 계약 정확성: 같은 값은 반드시 같은 hashCode를 반환하는가?
- 분포 품질: 서로 다른 값이 지나치게 같은 hash에 몰리지 않는가?

## hash에 사용하는 상태를 바꾸면 컬렉션 조회가 깨질 수 있다

```java
class Key {
    String value;

    @Override
    public boolean equals(Object other) {
        return other instanceof Key key
                && value.equals(key.value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }
}
```

이 객체를 `HashMap`의 key로 넣은 뒤 `value`를 바꾸면 저장 시점과 조회 시점의 hash가 달라질 수 있습니다.

```java
Key key = new Key("A");
Map<Key, String> map = new HashMap<>();
map.put(key, "value");

key.value = "B";
map.get(key); // 찾지 못할 수 있음
```

mutable 객체를 key로 사용하는 것이 언어적으로 금지된 것은 아닙니다. 하지만 **컬렉션에 들어 있는 동안 equals/hashCode에 영향을 주는 상태를 바꾸지 않는 계약**이 필요합니다. 그래서 key의 동등성 상태를 불변으로 만드는 설계가 다루기 쉽습니다.

## hashCode는 영구 식별자나 보안 hash가 아니다

`Object.hashCode`는 프로그램 실행을 넘어 안정적인 식별 값을 제공한다고 약속하지 않으며 충돌도 허용합니다.

```text
hashCode    → Java 객체 동등성과 hash 기반 자료구조를 위한 계약
영구 ID     → 저장·실행 경계를 넘어 유지되는 별도 식별자
암호학적 hash → 충돌 저항성 등 보안 요구를 가진 별도 알고리즘
```

이 셋은 목적이 다릅니다.

결국 `equals`와 `hashCode`를 함께 볼 때는 **같은 값이라는 의미를 두 메서드가 모순 없이 공유하는지**, 그리고 그 의미에 사용되는 상태가 컬렉션 사용 중 안정적인지를 확인하면 됩니다.
