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

`hashCode`는 객체를 하나의 `int` 값으로 표현하는 메서드입니다. 중요한 점은 hashCode가 **객체의 유일한 번호나 영구 식별자**가 아니라는 것입니다. 서로 다른 객체가 같은 hashCode를 가질 수 있고, 이를 충돌(collision)이라고 합니다.

hash 기반 컬렉션은 hashCode로 탐색 후보를 좁히고, 후보 안에서 equality를 확인하는 식으로 사용할 수 있습니다.

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

구체적인 bucket 배열, 보조 hash, tree 변환 같은 내용은 `HashMap` 구현 주제에서 다룹니다. 이 Concept에서 중요한 것은 특정 구현 방식이 아니라 **객체가 hash 기반 API에 제공해야 하는 계약**입니다.

### equals가 true라면 hashCode도 같아야 한다

가장 중요한 규칙은 다음입니다.

> `a.equals(b)`가 `true`라면 `a.hashCode() == b.hashCode()`여야 한다.

반대는 성립하지 않습니다. hashCode가 같더라도 `equals`는 `false`일 수 있습니다.

```text
equals == true  ──────>  같은 hashCode 필수
같은 hashCode   ──X──>  equals == true를 보장하지 않음
```

왜 이 방향이 중요한지 컬렉션 탐색으로 생각해 봅시다. 저장할 때 객체 A의 hash로 후보 영역을 정했는데, A와 `equals`인 객체 B가 다른 hash를 반환한다면 B로 조회할 때 아예 다른 후보 영역부터 보게 될 수 있습니다. 그러면 실제로 같은 값이 들어 있어도 equality 확인 단계에 도달하지 못할 수 있습니다.

### equals만 override하면 왜 문제가 될까

```java
final class Money {
    private final long amount;

    Money(long amount) {
        this.amount = amount;
    }

    @Override
    public boolean equals(Object other) {
        return other instanceof Money money
                && amount == money.amount;
    }
}
```

논리적으로 같은 `Money(1000)` 두 개를 만들 수 있지만 `hashCode`를 equality와 일관되게 재정의하지 않으면 hash 기반 컬렉션이 둘을 같은 값으로 다룬다는 전제를 세울 수 없습니다.

```java
Set<Money> values = new HashSet<>();
values.add(new Money(1000));

boolean found = values.contains(new Money(1000));
```

이 타입의 equality가 `amount`라면 `hashCode`도 같은 equality 의미를 따라야 합니다.

```java
@Override
public int hashCode() {
    return Long.hashCode(amount);
}
```

핵심은 `Objects.hash`를 쓰느냐 직접 계산하느냐가 아닙니다. **equals가 같다고 판단하는 모든 경우에 같은 hash를 만들도록 의미를 맞추는 것**입니다.

### hashCode가 equals의 모든 field를 반드시 사용해야 하는 것은 아니다

다음 타입이 `x`와 `y`를 모두 equality에 사용한다고 해 보겠습니다.

```java
@Override
public boolean equals(Object other) {
    return other instanceof Point point
            && x == point.x
            && y == point.y;
}

@Override
public int hashCode() {
    return Integer.hashCode(x);
}
```

이 구현은 `equals == true`인 두 객체가 반드시 같은 `x`를 가지므로 필수 계약은 지킬 수 있습니다. 하지만 같은 `x`를 가진 서로 다른 `y`들이 같은 hash에 몰려 충돌이 늘어날 수 있습니다.

즉 **계약 정확성과 hash 분포 품질은 다른 문제**입니다. 모든 객체에 상수 hash를 반환해도 equality 방향의 계약은 지킬 수 있지만 hash 기반 컬렉션의 장점을 크게 잃을 수 있습니다.

### mutable key는 계약을 지켜도 조회를 깨뜨릴 수 있다

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

`equals`와 `hashCode`가 같은 field를 사용하므로 구현만 보면 둘의 의미는 일치합니다. 하지만 이 객체를 `HashMap` key로 넣은 다음 `value`를 바꾸면 문제가 달라집니다.

```java
Key key = new Key("A");
Map<Key, String> map = new HashMap<>();
map.put(key, "value");

key.value = "B";
map.get(key); // 기대와 다르게 찾지 못할 수 있음
```

저장 시점과 조회 시점에 계산되는 hash가 달라질 수 있기 때문입니다. 그래서 hash key에 사용되는 equality 상태는 가능하면 불변으로 유지하는 편이 안전합니다.

여기서 “mutable object는 HashMap key로 절대 쓸 수 없다”가 규칙인 것은 아닙니다. 중요한 것은 **컬렉션에 들어 있는 동안 equality/hashCode에 영향을 주는 상태를 바꾸지 않는 계약**입니다.

### hashCode는 영구 ID나 보안 hash가 아니다

`Object.hashCode`의 계약은 서로 다른 프로그램 실행에서도 같은 객체 값이 같은 hash를 가져야 한다고 요구하지 않습니다. 충돌도 허용됩니다. 따라서 hashCode를 DB 식별자, 파일에 저장할 영구 key, 암호학적 fingerprint처럼 사용하면 안 됩니다.

```text
hashCode        : Java 객체 equality와 hash 기반 구조를 위한 int 계약
stable ID       : 실행·저장 경계를 넘어 유지할 별도 식별 계약
crypto hash     : 충돌 저항성 등 보안 요구를 가진 별도 알고리즘
```

이 셋은 이름에 “hash”나 “식별”의 느낌이 있어도 해결하는 문제가 다릅니다.

### 문제를 풀 때 확인할 것

- `equals`인 두 객체의 hashCode가 같은가?
- hashCode가 같아도 `equals`는 false일 수 있다는 방향을 구분했는가?
- equality/hash에 사용되는 상태가 컬렉션에 들어간 뒤 바뀌는가?
- 계약을 지키는 것과 충돌 분포가 좋은 것을 같은 문제로 보고 있지 않은가?
- `hashCode`를 영구 ID나 물리 주소처럼 해석하고 있지 않은가?

이 기준을 잡으면 “equals와 hashCode는 무조건 같은 field 개수로 만들어야 한다” 같은 암기에서 벗어나 **왜 같은 값을 같은 후보 영역에서 찾을 수 있어야 하는지**로 이해할 수 있습니다.

### 면접에서 이렇게 나옵니다

#### Q. equals를 재정의하면 왜 hashCode도 같이 재정의해야 하나요?

`equals`가 `true`인 두 객체는 반드시 같은 hashCode를 반환해야 한다는 계약이 있기 때문입니다. hash 기반 컬렉션은 hashCode로 먼저 탐색 후보를 좁히므로, 논리적으로 같은 두 객체가 서로 다른 hash를 반환하면 조회가 equality 확인 단계에 도달하지 못할 수 있습니다.

반대로 hashCode가 같다고 `equals`도 true여야 하는 것은 아닙니다. 서로 다른 객체의 hash 충돌은 허용됩니다.

#### Q. equals와 hashCode에 사용하는 field는 반드시 완전히 같아야 하나요?

필수 계약은 **equals가 true인 모든 경우에 hashCode도 같아야 한다**는 것입니다. 그래서 hashCode가 equality field의 일부만 사용해도 이 조건을 만족할 수는 있습니다.

다만 구분력이 낮아 충돌이 지나치게 많아지면 성능이 나빠질 수 있습니다. 따라서 계약을 지키는지와 좋은 hash 분포를 만드는지를 분리해서 판단해야 합니다.
