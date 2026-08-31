---
kind: concept
contentKey: java.core.coding-tests.comparator-for-coding-tests
topicContentKey: java.core.coding-tests
slug: comparator-for-coding-tests
title: "Comparator for coding tests"
summary: "문제의 다중 정렬 조건을 Comparator로 표현하고 subtraction overflow와 reversed 적용 범위를 피한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html"
    title: "Java SE 25 API: Comparator"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: compare 결과, comparing·thenComparing·reversed 조합 계약 확인
---
# 코딩테스트용 Comparator

"점수는 높은 순서, 점수가 같으면 이름은 사전순" 같은 조건은 코딩테스트에서 매우 자주 나옵니다. Comparator를 잘 쓰려면 문법보다 먼저 **문제의 정렬 조건을 우선순위 순서대로 분해**하면 됩니다.

### Comparator는 정확한 차이값이 아니라 순서 관계를 표현한다

Comparator의 비교 결과는 보통 다음 의미로 해석합니다.

```text
음수 -> 첫 번째 값이 앞
0    -> 비교 기준상 같은 순서
양수 -> 첫 번째 값이 뒤
```

따라서 "두 수의 실제 차이를 반환해야 한다"고 생각할 필요가 없습니다.

### `a - b`는 overflow 때문에 잘못된 순서를 만들 수 있다

```java
Comparator<Integer> unsafe = (a, b) -> a - b;
```

`a`가 매우 크고 `b`가 매우 작은 경우 뺄셈 결과가 `int` 범위를 넘어 overflow될 수 있습니다. 그러면 부호가 뒤집혀 comparator가 잘못된 순서를 반환할 수 있습니다.

다음처럼 비교 API를 사용하는 편이 안전합니다.

```java
Comparator<Integer> order = Integer::compare;
```

사용자 객체도 같은 원리입니다.

```java
Comparator<Node> order = (a, b) ->
        Integer.compare(a.distance(), b.distance());
```

### comparing과 thenComparing으로 문제 문장을 그대로 옮긴다

```java
record Student(String name, int score, int age) { }

Comparator<Student> order = Comparator
        .comparingInt(Student::score)
        .reversed()
        .thenComparing(Student::name)
        .thenComparingInt(Student::age);
```

코드를 왼쪽에서 오른쪽으로 읽으면:

1. score 기준
2. score는 내림차순
3. 같으면 name 오름차순
4. 그래도 같으면 age 오름차순

이런 식으로 문제의 우선순위를 그대로 표현할 수 있습니다.

### `reversed()`가 어디에 붙는지 주의한다

다중 조건에서는 전체 comparator를 뒤집는 것과 특정 key만 뒤집는 것이 다릅니다.

```java
Comparator<Student> byScoreThenName = Comparator
        .comparingInt(Student::score)
        .thenComparing(Student::name);

Comparator<Student> allReversed = byScoreThenName.reversed();
```

`allReversed`는 score뿐 아니라 전체 비교 결과를 뒤집습니다. "점수만 내림차순, 이름은 오름차순"이 요구사항이라면 score comparator만 reversed한 뒤 name을 추가해야 합니다.

```java
Comparator<Student> wanted = Comparator
        .comparingInt(Student::score)
        .reversed()
        .thenComparing(Student::name);
```

### 동점 처리 기준이 문제 결과를 결정할 수 있다

PriorityQueue나 정렬 문제에서 두 값의 주 기준이 같다면 어떤 값을 먼저 처리할지 추가 규칙이 필요할 수 있습니다.

예를 들어:

```text
거리 오름차순
거리 같으면 node id 오름차순
```

두 번째 기준을 빼면 문제에서 요구하는 출력 순서와 달라질 수 있습니다. "동점이면 아무 순서나 가능"이라고 명시되지 않았다면 tie-breaker를 확인합니다.

### Comparator의 0과 equals는 같은 의미가 아닐 수 있다

Comparator가 0을 반환한다는 것은 **그 comparator 기준에서 두 값의 순서가 같다는 뜻**입니다. 반드시 `a.equals(b)`가 true라는 뜻은 아닙니다.

```java
Comparator<Student> byScore = Comparator.comparingInt(Student::score);
```

점수가 같은 서로 다른 학생 둘은 comparator 결과가 0일 수 있습니다. 이 차이는 `TreeSet`, `TreeMap` 같은 sorted collection에서 더 중요하지만 코딩테스트에서도 "동점"의 의미를 정확히 이해하는 데 필요합니다.

### 문제를 풀 때 확인할 것

1. 정렬 key를 우선순위대로 적습니다.
2. 각 key가 오름차순인지 내림차순인지 표시합니다.
3. subtraction comparator가 overflow될 수 있는지 봅니다.
4. `reversed()`가 전체 comparator를 뒤집는지 특정 key만 뒤집는지 확인합니다.
5. 동점일 때 추가 기준이 필요한지 확인합니다.

### 면접이나 코드 리뷰에서 설명한다면

Comparator는 두 객체의 순서 관계를 음수·0·양수로 표현하며 실제 차이값을 반환할 필요는 없습니다. 숫자 비교에서 `a - b`는 overflow 위험이 있어 `Integer.compare`나 `comparingInt` 같은 API가 안전합니다. 여러 정렬 조건은 `thenComparing`으로 표현하고, `reversed()`가 적용되는 범위를 주의해야 합니다.
