---
kind: concept
contentKey: java.core.object-contracts.equals-contract
topicContentKey: java.core.object-contracts
slug: equals-contract
title: "equals 계약과 논리적 동등성"
summary: "같은 객체인지가 아니라 논리적으로 같은 값인지 판단할 때 equals가 지켜야 하는 규칙과 상태 선택 기준을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)"
    title: "Java SE 25 API: Object.equals"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: equals의 공식 계약 확인
  - url: "https://tecoble.techcourse.co.kr/post/2020-06-11-value-object/"
    title: "VO(Value Object)란 무엇일까?"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: 값 객체의 동일성·동등성 구분과 equals/hashCode 재정의를 한국어 예제로 복습
---
# equals 계약과 논리적 동등성

두 참조 변수가 같은 객체를 가리키는지는 `==`로 확인할 수 있습니다. 하지만 실무에서는 서로 다른 인스턴스여도 **도메인 관점에서 같은 값으로 취급해야 하는 경우**가 많습니다. `equals`는 이런 논리적 동등성을 표현하는 메서드입니다.

```java
Money a = new Money(10_000);
Money b = new Money(10_000);

System.out.println(a == b);       // false일 수 있음
System.out.println(a.equals(b));  // Money의 값 동등성 계약에 따라 true가 될 수 있음
```

`a`와 `b`는 서로 다른 객체일 수 있지만 금액 값으로 의미를 정의한 `Money`라면 둘을 같다고 보는 것이 자연스럽습니다. 여기서 중요한 것은 `equals`가 “모든 field가 같나?”를 자동으로 판단하는 기능이 아니라 **이 타입이 무엇을 같은 값으로 볼 것인지 직접 정의하는 계약**이라는 점입니다.

### equals는 동등 관계의 규칙을 지켜야 한다

`Object.equals` 계약은 대표적으로 다음 성질을 요구합니다.

- **반사성(reflexive)**: `x.equals(x)`는 `true`
- **대칭성(symmetric)**: `x.equals(y)`가 `true`라면 `y.equals(x)`도 `true`
- **추이성(transitive)**: `x.equals(y)`와 `y.equals(z)`가 `true`라면 `x.equals(z)`도 `true`
- **일관성(consistent)**: 비교에 사용되는 상태가 바뀌지 않았다면 반복 호출 결과가 같아야 함
- null이 아닌 `x`에 대해 `x.equals(null)`은 `false`

이 규칙은 단순 시험 암기 항목이 아닙니다. 컬렉션이나 테스트 도구는 `equals`가 이런 동등 관계를 제공한다고 가정하고 객체를 다룹니다. 호출 방향이나 비교 순서에 따라 결과가 달라지면 “같은 값”이라는 의미 자체가 안정적이지 않게 됩니다.

### 가장 어려운 부분은 어떤 상태를 비교할지 정하는 것이다

```java
class Member {
    private Long id;
    private String email;
    private String nickname;
}
```

`Member`의 논리적 동일성을 `id`로 볼지, `email`로 볼지, 여러 필드 조합으로 볼지는 Java 문법이 정해 주지 않습니다. **객체의 의미와 생명주기**가 결정해야 합니다.

값 객체라면 이 판단이 비교적 분명할 수 있습니다.

```java
final class Money {
    private final long amount;
    private final Currency currency;
}
```

이 타입의 의미가 “금액 + 통화”라면 둘을 함께 equality에 포함하는 것이 자연스럽습니다. 반대로 계산 성능을 위한 cache, 화면 표시용 임시 값처럼 **객체의 값 의미를 구성하지 않는 파생 상태**를 equality에 넣으면 부수 상태가 바뀔 때 같은 값이 갑자기 다른 값이 될 수 있습니다.

엔티티는 더 조심해야 합니다. 예를 들어 DB 저장 전에는 `id == null`이고 저장 후 식별자가 생기는 객체에서 DB id만 `equals`에 사용하면 생명주기에 따라 동등성 결과나 hash 기반 컬렉션에서의 위치가 달라질 수 있습니다. ORM proxy까지 결합되면 타입 검사 방식도 별도 고려가 필요합니다. 따라서 엔티티 equality를 IDE 생성 기능에 맡기기 전에 **이 모델의 identity가 무엇이며 언제 안정되는지** 먼저 결정해야 합니다.

### 상속과 equals는 대칭성을 쉽게 깨뜨린다

다음처럼 상위 타입은 금액만 보고, 하위 타입은 추가 필드까지 비교한다고 해 보겠습니다.

```java
class Money {
    int amount;

    @Override
    public boolean equals(Object other) {
        return other instanceof Money money
                && amount == money.amount;
    }
}

class Voucher extends Money {
    String code;

    @Override
    public boolean equals(Object other) {
        return other instanceof Voucher voucher
                && super.equals(voucher)
                && code.equals(voucher.code);
    }
}
```

`Money` 쪽에서는 같은 금액의 `Voucher`를 같다고 판단할 수 있지만 `Voucher` 쪽에서는 `code`까지 요구합니다. 그러면 `money.equals(voucher)`와 `voucher.equals(money)`가 다른 결과를 낼 수 있어 대칭성이 깨집니다.

`instanceof` 대신 `getClass()`를 쓰면 정확히 같은 runtime class끼리만 비교하게 만들어 이런 혼합을 차단할 수 있지만, 대신 상위·하위 타입 사이의 값 동등성을 허용하지 않는 선택이 됩니다. 어느 쪽이 항상 정답인 것이 아니라 **해당 타입 계층에서 상속 객체끼리 동등성을 허용해야 하는가**를 먼저 판단해야 합니다.

그래서 값 객체는 불변으로 만들고 클래스 계층을 단순하게 유지하면 `equals`를 설계하기 쉬운 경우가 많습니다.

### equals를 바꾸면 hashCode도 같은 의미를 따라야 한다

`HashSet`, `HashMap`의 key, 중복 제거 등 hash 기반 API는 `equals`뿐 아니라 `hashCode`도 함께 사용합니다. `equals`에서 금액과 통화를 비교하는데 `hashCode`가 전혀 다른 의미의 상태를 사용하면 논리적으로 같은 객체를 컬렉션이 제대로 찾지 못할 수 있습니다.

```text
논리적 equality를 결정하는 상태
          │
          ├─ equals
          └─ hashCode 계약에도 일관되게 반영
```

정확한 hash 후보 탐색과 충돌 처리는 다음 Concept에서 다룹니다. 여기서는 **equals를 재정의하면 hashCode 계약도 함께 검토해야 한다**는 연결만 잡으면 됩니다.

### 문제를 풀 때 확인할 것

1. 비교하려는 것은 객체 identity인가, 논리적인 value equality인가?
2. `equals`에 어떤 상태가 포함되는가?
3. 그 상태가 객체 생명주기 중 바뀔 수 있는가?
4. 상속 관계에서 대칭성·추이성을 깨지 않는가?
5. 같은 equality 기준을 `hashCode`에서도 지킬 수 있는가?

다섯 가지 계약을 외우는 것보다 **왜 이 타입에서 두 객체를 같은 값이라고 부르는지 설명할 수 있는가**가 더 중요합니다. 그 기준이 안정되어야 컬렉션과 다른 코드도 같은 의미를 사용할 수 있습니다.

### 면접에서 이렇게 나옵니다

#### Q. `==`와 `equals`는 무엇이 다른가요?

참조 타입에서 `==`는 두 표현식의 참조 값이 같은 객체를 가리키는지를 비교합니다. `equals`는 타입이 정의한 **논리적 동등성**을 비교하며, `Object`의 기본 구현을 그대로 쓰는지 재정의하는지에 따라 의미가 달라집니다.

따라서 “`equals`는 무조건 field 값을 비교한다”라고 말하면 정확하지 않습니다. 어떤 상태를 같은 값의 기준으로 볼지는 해당 타입의 계약입니다.

#### Q. equals 구현에서 `instanceof`와 `getClass()` 중 무엇을 써야 하나요?

둘 중 하나가 항상 정답은 아닙니다. `instanceof`는 하위 타입까지 비교 대상으로 허용할 수 있지만 하위 타입이 equality state를 추가하면 대칭성·추이성을 깨기 쉽습니다. `getClass()`는 정확히 같은 runtime class만 비교해 그런 혼합을 막지만 상위·하위 타입 사이의 동등성도 허용하지 않습니다.

먼저 타입 계층에서 서로 다른 runtime class를 같은 값으로 볼 수 있는지를 정하고, 그 선택이 `equals` 계약을 끝까지 유지하는지 확인해야 합니다.
