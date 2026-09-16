---
kind: concept
contentKey: java.core.object-contracts.comparable-natural-order
topicContentKey: java.core.object-contracts
slug: comparable-natural-order
title: "Comparable과 자연 순서"
summary: "타입 자체가 하나의 대표 순서를 정의할 때 Comparable을 사용하고 compareTo와 equals의 일관성이 sorted collection에 미치는 영향을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Comparable.html"
    title: "Java SE 25 API: Comparable"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 자연 순서와 compareTo 계약 확인
---
# Comparable과 자연 순서

어떤 타입에는 사용자 대부분이 기대하는 대표적인 순서가 있을 수 있습니다. 숫자의 크기나 날짜의 시간 순서처럼 타입 자체가 제공하는 기본 순서를 **자연 순서(natural ordering)** 라고 하며 Java에서는 `Comparable<T>`로 표현합니다.

```java
record Score(int value) implements Comparable<Score> {
    @Override
    public int compareTo(Score other) {
        return Integer.compare(value, other.value);
    }
}
```

`compareTo`는 현재 객체가 상대보다 작으면 음수, 순서상 같으면 0, 크면 양수를 반환합니다. 정확히 `-1`, `0`, `1`만 반환해야 하는 것이 아니라 **부호가 순서를 나타냅니다.**

### 비교 결과는 일관된 순서를 만들어야 한다

정렬 알고리즘과 정렬 컬렉션은 비교 결과가 자기모순 없는 순서를 만든다고 가정합니다.

```text
a < b 이면 b > a

a < b 이고 b < c 이면 a < c
```

비교에 사용하는 상태가 바뀌지 않았다면 반복 비교의 의미도 안정적이어야 합니다. `a < b`, `b < c`인데 `a > c`가 되는 식의 기준은 정렬 관계를 깨뜨립니다.

### 뺄셈으로 비교하면 오버플로가 생길 수 있다

```java
return this.value - other.value;
```

큰 정수끼리 뺄 때 `int` 범위를 넘으면 부호가 뒤집혀 잘못된 비교 결과가 나올 수 있습니다. 비교에는 차이의 정확한 크기가 필요하지 않으므로 다음처럼 비교 API를 사용하는 편이 안전합니다.

```java
return Integer.compare(this.value, other.value);
```

`long`이면 `Long.compare`처럼 타입에 맞는 비교 메서드를 사용할 수 있습니다.

### compareTo가 0이라고 equals도 반드시 true인 것은 아니다

자연 순서가 `equals`와 일관되는 것이 권장되지만 모든 Java 타입이 이를 강제하는 것은 아닙니다. 대표적인 예가 `BigDecimal`입니다.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("1.00");

System.out.println(a.compareTo(b)); // 0
System.out.println(a.equals(b));    // false
```

`compareTo`는 수치상 같은 위치로 보지만 `equals`는 scale까지 고려합니다. 이 차이는 컬렉션에서도 드러납니다. `HashSet`은 `equals/hashCode`를 사용하고 `TreeSet`은 정렬 기준으로 원소를 구분하므로 같은 두 객체의 포함 결과가 달라질 수 있습니다.

자신의 타입에 자연 순서를 정의한다면 **`compareTo(...) == 0`이 무엇을 같은 순서 위치로 보는지와 `equals`의 동등성 기준이 어떤 관계인지** 의도적으로 정해야 합니다.

### 정렬 기준에 사용하는 상태도 안정적이어야 한다

`TreeSet` 같은 정렬 컬렉션에 객체를 넣은 뒤 `compareTo`에 사용하는 상태를 바꾸면, 저장된 위치와 이후 비교 결과가 달라질 수 있습니다. hash key의 동등성 상태를 바꾸는 문제와 비슷합니다.

따라서 정렬 컬렉션의 위치를 결정하는 상태는 가능한 한 컬렉션에 들어 있는 동안 안정적으로 유지하는 편이 좋습니다.

### 모든 타입에 자연 순서가 필요한 것은 아니다

`Member`를 이름, 가입일, 점수, ID 중 무엇으로 정렬해야 할지 문맥마다 달라진다면 타입 자체에 하나를 자연 순서로 고정하는 것이 오히려 애매할 수 있습니다.

```text
타입 자체에 대표 순서가 분명함 → Comparable 후보
문맥마다 정렬 기준이 달라짐     → Comparator 후보
```

`Comparable`은 단순히 “정렬 가능하게 만드는 인터페이스”가 아니라 **타입 자체가 제공하는 대표적인 순서 계약**이라고 이해하면 됩니다.
