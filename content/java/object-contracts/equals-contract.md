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
---
# equals 계약과 논리적 동등성

두 참조 변수가 같은 객체를 가리키는지는 `==`로 확인할 수 있습니다. 하지만 실무에서는 객체가 서로 다른 인스턴스여도 **도메인 관점에서 같은 값으로 취급해야 하는 경우**가 많습니다. `equals`는 이런 논리적 동등성을 표현하는 메서드입니다.

```java
Money a = new Money(10_000);
Money b = new Money(10_000);
```

`a`와 `b`는 서로 다른 객체일 수 있지만 금액 값으로만 의미를 정의한 `Money`라면 둘을 같다고 보는 것이 자연스러울 수 있습니다.

### equals는 몇 가지 규칙을 지켜야 한다

`Object.equals` 계약은 대표적으로 다음 성질을 요구합니다.

- **반사성**: `x.equals(x)`는 `true`
- **대칭성**: `x.equals(y)`와 `y.equals(x)`의 결과가 같아야 함
- **추이성**: `x==y`, `y==z`에 해당하는 논리적 동등 관계가 이어져야 함
- **일관성**: 비교에 사용되는 상태가 바뀌지 않았다면 반복 호출 결과가 같아야 함
- `x.equals(null)`은 `false`

이 규칙을 깨면 컬렉션이나 다른 라이브러리가 객체를 다루는 방식이 예상과 달라질 수 있습니다.

### 가장 어려운 부분은 어떤 상태를 비교할지 정하는 것이다

```java
class Member {
    private Long id;
    private String email;
    private String nickname;
}
```

`Member`의 논리적 동일성을 `id`로 볼지, `email`로 볼지, 여러 필드 조합으로 볼지는 Java 문법이 정해 주지 않습니다. **객체의 의미와 생명주기**가 결정해야 합니다.

예를 들어 DB 저장 전에는 `id == null`이고 저장 후 식별자가 생기는 엔티티에서 `id`만 equals에 사용하면 객체 생명주기에 따라 동등성 결과가 달라질 수 있습니다. 이 문제는 ORM과 결합하면 더 복잡해지므로 단순히 IDE가 생성한 equals를 그대로 사용하기보다 모델의 identity를 먼저 정해야 합니다.

### 상속과 equals는 특히 조심해야 한다

상위 클래스와 하위 클래스가 서로 다른 필드를 동등성에 포함하면 대칭성이나 추이성을 깨뜨리기 쉽습니다. `instanceof`를 사용할지 `getClass()`를 사용할지도 모델 요구에 따라 결과가 달라집니다.

그래서 값 객체는 불변으로 만들고 클래스 계층을 단순하게 유지하면 equals를 설계하기 쉬운 경우가 많습니다.

### 실무에서 자주 연결되는 곳

`HashSet`, `HashMap`의 key, 테스트 assertion, 중복 제거 등은 `equals` 결과에 의존할 수 있습니다. 특히 `equals`를 override했다면 `hashCode` 계약도 함께 고려해야 합니다.

### 문제를 풀 때 확인할 것

1. 비교하려는 것은 객체 identity인가, 논리적인 값 equality인가?
2. equals에 어떤 필드가 포함되는가?
3. 그 필드가 객체 생명주기 중 바뀔 수 있는가?
4. 상속 관계에서 대칭성·추이성을 깨지 않는가?

면접에서는 다섯 가지 계약을 나열하는 것보다 **왜 계약을 지켜야 하고 어떤 상태를 동등성에 포함할지 설계가 중요하다**고 설명할 수 있어야 합니다.
