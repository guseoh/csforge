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

참조 타입에서 `==`는 두 참조가 같은 객체를 가리키는지 비교합니다. 반면 `equals`는 타입이 정의한 **논리적 동등성**을 표현할 수 있습니다.

```java
Money a = new Money(10_000);
Money b = new Money(10_000);

System.out.println(a == b);       // false일 수 있음
System.out.println(a.equals(b));  // 값 동등성 계약에 따라 true 가능
```

`equals`가 모든 필드를 자동으로 비교해 주는 것은 아닙니다. **이 타입에서 무엇을 같은 값으로 볼 것인지**를 타입이 직접 정의하는 계약입니다.

### equals가 지켜야 하는 기본 성질

`Object.equals`의 계약은 다음과 같은 동등 관계를 요구합니다.

- 반사성: `x.equals(x)`는 `true`
- 대칭성: `x.equals(y)`가 `true`라면 `y.equals(x)`도 `true`
- 추이성: `x.equals(y)`와 `y.equals(z)`가 `true`라면 `x.equals(z)`도 `true`
- 일관성: 비교에 사용하는 상태가 바뀌지 않았다면 반복 호출 결과가 같아야 함
- null이 아닌 `x`에 대해 `x.equals(null)`은 `false`

이 규칙이 깨지면 비교 순서에 따라 결과가 달라지거나 컬렉션이 기대하는 “같은 값”의 의미가 불안정해질 수 있습니다.

### 가장 중요한 설계는 비교에 사용할 상태를 정하는 것이다

```java
final class Money {
    private final long amount;
    private final Currency currency;
}
```

`Money`의 의미가 금액과 통화의 조합이라면 둘을 함께 비교하는 것이 자연스럽습니다. 반대로 캐시 값이나 화면 표시를 위한 파생 상태처럼 객체의 값 의미를 구성하지 않는 필드를 equality에 넣으면 부수 상태가 바뀔 때 동등성까지 흔들릴 수 있습니다.

엔티티처럼 생명주기 중 식별자가 생기거나 바뀌는 객체는 더 신중해야 합니다. DB 저장 전에는 `id == null`이고 저장 뒤 식별자가 생기는 모델에서 DB id만 동등성 기준으로 사용하면 객체 생명주기에 따라 `equals`와 `hashCode` 결과가 달라질 수 있습니다. Java 문법이 정답을 정해 주는 문제가 아니라 **그 객체의 identity가 무엇이며 언제부터 안정적인가**를 먼저 결정해야 합니다.

### 상속 계층에서는 대칭성을 깨뜨리기 쉽다

상위 타입은 공통 필드만 비교하고 하위 타입은 추가 필드까지 비교하면 한쪽에서는 같다고 판단하고 반대쪽에서는 다르다고 판단할 수 있습니다.

```text
money.equals(voucher)  → true
voucher.equals(money)  → false
```

`instanceof`를 쓸지 `getClass()`를 쓸지는 타입 계층의 의미에 따라 달라질 수 있습니다. 중요한 것은 **서로 다른 런타임 타입을 같은 값으로 볼 것인지 정하고, 그 선택이 대칭성과 추이성을 끝까지 지키는지**입니다.

### equals를 재정의하면 hashCode도 같은 의미를 따라야 한다

`HashSet`, `HashMap` 같은 자료구조는 `equals`와 `hashCode`를 함께 사용합니다. 논리적으로 같은 객체라면 같은 hashCode를 반환해야 합니다.

```text
논리적 동등성을 결정하는 상태
        ├─ equals
        └─ hashCode에도 일관되게 반영
```

정확한 hash 계약과 충돌 문제는 다음 Concept에서 다룹니다. 여기서는 `equals`를 바꿨다면 `hashCode`도 같은 동등성 의미를 따르는지 반드시 확인해야 한다는 점만 연결하면 됩니다.

`equals`를 구현할 때 가장 먼저 물어야 할 질문은 단순합니다. **이 타입에서 두 객체를 왜 같은 값이라고 부르는가?** 그 기준이 명확하고 안정적이어야 나머지 코드와 컬렉션도 같은 의미를 사용할 수 있습니다.
