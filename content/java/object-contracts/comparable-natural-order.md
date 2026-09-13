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

어떤 타입에는 사용자 대부분이 기대하는 대표적인 순서가 있을 수 있습니다. 숫자는 크기 순서, 날짜는 시간 순서처럼 타입 자체가 제공하는 기본 순서를 **자연 순서(natural ordering)** 라고 부릅니다. Java에서는 `Comparable<T>`가 이 계약을 표현합니다.

```java
record Score(int value) implements Comparable<Score> {
    @Override
    public int compareTo(Score other) {
        return Integer.compare(value, other.value);
    }
}
```

`compareTo`는 현재 객체가 상대보다 작으면 음수, 순서상 같으면 0, 크면 양수를 반환합니다. 정확히 `-1`, `0`, `1`만 반환해야 하는 것은 아닙니다. 호출자는 값 자체가 아니라 **결과의 부호**를 사용합니다.

### 비교 결과는 서로 모순되지 않아야 한다

정렬이 가능하려면 비교 결과가 일관된 순서 관계를 만들어야 합니다. 대표적으로 다음처럼 생각할 수 있습니다.

```text
a < b 이면 b > a

a < b 이고 b < c 이면 a < c

비교에 사용하는 상태가 바뀌지 않았다면 반복 비교의 의미도 유지
```

예를 들어 `a.compareTo(b) < 0`인데 `b.compareTo(a) < 0`도 동시에 성립하면 둘 다 상대보다 작다고 말하는 셈이라 정렬 기준이 자기모순이 됩니다. 정렬 알고리즘과 `TreeSet` 같은 sorted collection은 비교 계약이 안정적이라고 가정합니다.

### subtraction으로 비교하면 overflow가 생길 수 있다

```java
return this.value - other.value;
```

단순해 보이지만 큰 정수끼리 빼면 overflow로 부호가 뒤집힐 수 있습니다.

```java
int a = Integer.MAX_VALUE;
int b = -1;

System.out.println(a - b); // overflow 가능
```

비교에서는 차이의 정확한 크기가 필요한 것이 아니라 어느 쪽이 큰지에 대한 부호가 필요합니다. 그래서 `Integer.compare`, `Long.compare` 같은 비교 API를 사용하는 편이 안전합니다.

```java
return Integer.compare(this.value, other.value);
```

### `compareTo == 0`과 `equals == true`는 다른 계약이다

자연 순서는 equality와 일관되는 것이 강하게 권장되지만 Java가 모든 타입에 이를 강제하지는 않습니다. 대표적인 예가 `BigDecimal`입니다.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("1.00");

System.out.println(a.compareTo(b)); // 0
System.out.println(a.equals(b));    // false
```

`compareTo`는 수치 크기를 기준으로 두 값을 같은 순서 위치로 보지만 `equals`는 scale까지 고려합니다. 이 차이는 sorted collection에서 실제 결과가 됩니다.

```java
Set<BigDecimal> hash = new HashSet<>();
hash.add(a);
hash.add(b);

Set<BigDecimal> tree = new TreeSet<>();
tree.add(a);
tree.add(b);
```

`HashSet`은 `equals/hashCode` 계약을 사용하고 `TreeSet`은 natural ordering 결과를 원소 구분에 사용하므로 두 Set의 크기가 다를 수 있습니다. 그래서 자신의 타입에 자연 순서를 정의할 때는 **`compareTo(...) == 0`이 무엇을 같은 값으로 보는지**와 `equals` 기준의 관계를 의도적으로 정해야 합니다.

### 정렬에 사용되는 상태가 바뀌면 sorted collection도 흔들릴 수 있다

다음처럼 priority를 natural order에 사용한다고 해 보겠습니다.

```java
class Task implements Comparable<Task> {
    int priority;

    @Override
    public int compareTo(Task other) {
        return Integer.compare(priority, other.priority);
    }
}
```

`TreeSet`에 넣은 뒤 `priority`를 바꾸면 객체 자체는 같은 위치에 저장되어 있는데 이후 비교 결과는 달라집니다. hash key의 equality state를 바꾸는 문제와 원리는 비슷합니다. **컬렉션이 위치를 결정할 때 사용한 기준을 저장 후 임의로 바꾸면 탐색 전제가 깨질 수 있습니다.**

따라서 sorted collection의 key/order에 영향을 주는 상태도 가능하면 안정적으로 유지하는 것이 좋습니다.

### 모든 타입에 자연 순서가 필요한 것은 아니다

`Member`를 무엇으로 정렬해야 할까요? 가입일, 이름, 점수, ID 등 여러 기준이 모두 가능하다면 타입 자체에 하나를 자연 순서로 박는 것이 오히려 애매할 수 있습니다.

```text
타입 자체에 대표 순서가 분명함
        └─ Comparable 후보

문맥마다 순서가 달라짐
        └─ Comparator 후보
```

자연 순서는 “정렬할 수 있게 만들기 위해 일단 넣는 기본값”이 아니라 **이 타입의 사용자가 일반적으로 기대할 하나의 대표 순서**여야 합니다. 그렇지 않다면 외부 `Comparator`로 정렬 의도를 호출 지점에 드러내는 편이 더 낫습니다.

### 문제를 풀 때 확인할 것

- 이 타입에 정말 하나의 대표 순서가 있는가?
- `compareTo`의 부호 관계와 추이성이 모순되지 않는가?
- 정수 subtraction으로 overflow 가능성을 만들지 않았는가?
- `compareTo == 0`과 `equals`의 관계가 sorted collection에 어떤 영향을 주는가?
- ordering에 사용되는 상태가 collection에 들어간 뒤 바뀌는가?

`Comparable`을 단순한 “정렬 인터페이스”로 외우기보다 **타입 자체가 제공하는 자연 순서의 계약**이라고 이해하면 `Comparator`를 써야 할 상황도 함께 구분할 수 있습니다.

### 면접에서 이렇게 나옵니다

#### Q. `compareTo()`가 0이면 `equals()`도 반드시 true인가요?

반드시 그런 것은 아닙니다. `Comparable` 문서는 자연 순서가 equals와 일관되는 것을 강하게 권장하지만 예외가 존재할 수 있고, `BigDecimal`이 대표적인 사례입니다.

이 차이는 단순 표현 문제가 아니라 `TreeSet`과 `HashSet`의 중복 판정이 달라질 수 있다는 실제 API 동작으로 이어집니다. 자신이 만든 타입이라면 두 기준이 왜 같거나 달라야 하는지 명시적으로 설계해야 합니다.

#### Q. `return a - b`로 숫자를 비교하면 왜 위험한가요?

뺄셈 결과가 `int` 범위를 넘으면 overflow로 부호가 뒤집힐 수 있기 때문입니다. 비교 계약에서는 차이의 크기보다 부호가 중요한데 overflow가 그 부호를 잘못 만들 수 있습니다.

그래서 `Integer.compare(a, b)`, `Long.compare(a, b)`처럼 overflow 없이 순서를 표현하는 비교 API를 사용하는 편이 안전합니다.
