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

`compareTo`는 현재 객체가 상대보다 작으면 음수, 같다고 판단하면 0, 크면 양수를 반환합니다. 정확히 `-1`, `0`, `1`만 반환해야 하는 것은 아닙니다.

### subtraction으로 비교하면 overflow가 생길 수 있다

```java
return this.value - other.value;
```

단순해 보이지만 큰 정수끼리 빼면 overflow로 부호가 뒤집힐 수 있습니다. 그래서 `Integer.compare`, `Long.compare` 같은 비교 API를 사용하는 편이 안전합니다.

### `compareTo == 0`과 `equals == true`가 다르면 어떤 일이 생길까

정렬된 컬렉션은 ordering 결과를 원소 구분에 사용할 수 있습니다.

```java
SortedSet<BigDecimal> values = new TreeSet<>();
```

어떤 타입에서 `compareTo`가 0이라고 판단하는 두 객체가 `equals`에서는 다르다면 일반 `HashSet`과 `TreeSet`의 “중복” 결과가 다르게 보일 수 있습니다.

`Comparable` 문서도 자연 순서가 equals와 일관되는 것이 강하게 권장된다는 점과 예외 가능성을 설명합니다. 따라서 자신의 타입에 자연 순서를 정의한다면 **동등성 기준과 순서 기준의 관계**를 의식해야 합니다.

### 모든 타입에 자연 순서가 필요한 것은 아니다

`Member`를 무엇으로 정렬해야 할까요? 가입일, 이름, 점수, ID 등 여러 기준이 모두 가능하다면 타입 자체에 하나를 자연 순서로 박는 것이 오히려 애매할 수 있습니다. 이런 경우 외부 `Comparator`로 정렬 기준을 명시하는 편이 더 낫습니다.

### 문제를 풀 때 확인할 것

- 이 타입에 정말 하나의 대표 순서가 있는가?
- `compareTo`의 부호 계약을 지키는가?
- 정수 subtraction으로 overflow 가능성을 만들지 않았는가?
- `compareTo == 0`과 `equals`의 관계가 sorted collection에 어떤 영향을 주는가?

면접에서는 Comparable이 “정렬 인터페이스”라고만 말하기보다 **타입의 자연 순서를 정의하는 계약**이라고 설명하는 편이 정확합니다.
