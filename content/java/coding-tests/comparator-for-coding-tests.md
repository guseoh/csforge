---
kind: concept
contentKey: java.core.coding-tests.comparator-for-coding-tests
topicContentKey: java.core.coding-tests
slug: comparator-for-coding-tests
title: "코딩 테스트용 Comparator"
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
    relationNote: compare 결과, 비교 계약, comparing·thenComparing·reversed 조합 확인
---
# 코딩 테스트용 Comparator

"점수는 높은 순서, 점수가 같으면 이름은 사전순" 같은 조건은 코딩테스트에서 매우 자주 나옵니다. Comparator를 잘 쓰려면 문법보다 먼저 **문제의 정렬 조건을 우선순위 순서대로 분해**하면 됩니다.

### Comparator는 정확한 차이값이 아니라 순서 관계를 표현한다

Comparator의 비교 결과는 다음 의미를 가집니다.

```text
음수 -> 첫 번째 값이 앞
0    -> comparator 기준에서 같은 순서
양수 -> 첫 번째 값이 뒤
```

정확히 `-1`, `0`, `1`만 반환할 필요도 없고 두 값의 실제 차이를 반환할 필요도 없습니다. 중요한 것은 반환값의 **부호가 일관된 순서 관계를 표현하는 것**입니다.

### `a - b`는 overflow 때문에 순서를 뒤집을 수 있다

```java
Comparator<Integer> unsafe = (a, b) -> a - b;
```

`a`가 매우 크고 `b`가 매우 작은 경우 뺄셈 결과가 `int` 범위를 넘어 overflow될 수 있습니다. 예를 들어 원래는 `a < b`여야 하는데 subtraction 결과의 부호가 뒤집히면 comparator가 반대 순서를 보고합니다.

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

코드를 왼쪽에서 오른쪽으로 읽으면 다음과 같습니다.

1. score 기준
2. score는 내림차순
3. 같으면 name 오름차순
4. 그래도 같으면 age 오름차순

`thenComparing`은 앞의 comparator가 두 원소를 같다고 판단한 경우, 즉 `compare(a, b) == 0`일 때 다음 기준을 적용합니다. 문제의 tie-breaker를 이 순서대로 옮기면 조건 누락을 줄일 수 있습니다.

### `reversed()`가 어디에 붙는지 주의한다

다중 조건에서는 전체 comparator를 뒤집는 것과 특정 key만 뒤집는 것이 다릅니다.

```java
Comparator<Student> byScoreThenName = Comparator
        .comparingInt(Student::score)
        .thenComparing(Student::name);

Comparator<Student> allReversed = byScoreThenName.reversed();
```

`allReversed`는 이미 만들어진 **전체 비교 순서**를 뒤집습니다. "점수만 내림차순, 이름은 오름차순"이 요구사항이라면 score comparator만 뒤집은 뒤 name을 추가해야 합니다.

```java
Comparator<Student> wanted = Comparator
        .comparingInt(Student::score)
        .reversed()
        .thenComparing(Student::name);
```

### Comparator는 호출할 때마다 같은 순서 규칙을 유지해야 한다

정렬 알고리즘이나 `PriorityQueue`는 comparator가 일관된 순서 관계를 준다고 가정합니다. 공식 API 계약에는 대표적으로 다음 성질이 포함됩니다.

```text
compare(a, b)의 부호와 compare(b, a)의 부호는 반대여야 함

a > b 이고 b > c 라면 a > c 여야 함

compare(a, b) == 0이라면
다른 값 z와 비교할 때 a와 b가 모순된 순서를 만들면 안 됨
```

예를 들어 비교할 때마다 현재 시각이나 난수를 사용해 결과가 달라지는 comparator는 올바른 정렬 기준이 되기 어렵습니다.

```java
// 이런 식으로 비교 결과가 호출 시점마다 흔들리면 안 된다.
Comparator<Integer> broken = (a, b) ->
        Math.random() < 0.5 ? -1 : 1;
```

코딩테스트에서는 보통 문제의 입력 값만으로 순서를 결정하므로 이런 오류를 만날 일이 적지만, 직접 comparator를 구현할 때 **모든 비교 쌍에 대해 일관된 total ordering을 만들고 있는지** 확인하는 습관이 중요합니다.

### Comparator의 0과 `equals`는 반드시 같은 의미는 아니다

Comparator가 0을 반환한다는 것은 **그 comparator가 사용하는 정렬 기준에서 두 원소를 같은 순서 그룹으로 본다**는 뜻입니다. 반드시 `a.equals(b)`까지 true라는 뜻은 아닙니다.

```java
Comparator<Student> byScore =
        Comparator.comparingInt(Student::score);
```

점수가 같은 서로 다른 학생 둘은 comparator 결과가 0일 수 있습니다. 단순 배열/List 정렬에서는 이 사실을 동점으로 이해하면 되지만, 같은 comparator를 `TreeSet`이나 `TreeMap`에 사용하면 ordering과 `equals`의 불일치가 collection 의미에 영향을 줄 수 있습니다.

코딩테스트에서 최종 출력 순서까지 결정해야 한다면 점수만 비교하고 끝낼 것이 아니라 문제에 필요한 `name`, `id` 같은 tie-breaker가 있는지 확인합니다.

### 동점 처리 기준을 문제 문장에서 먼저 찾는다

예를 들어 다음 조건이 있다고 하겠습니다.

```text
1. 거리 오름차순
2. 거리가 같으면 node id 오름차순
```

거리만 비교하면 서로 다른 node가 comparator 기준으로 동점이 됩니다. 문제에서 동점 순서를 요구하면 두 번째 기준을 빠뜨린 순간 구현이 불완전합니다.

반대로 문제에서 "동점일 때 순서는 상관없다"고 명확히 보장한다면 불필요한 tie-breaker를 추가할 필요는 없습니다. Comparator는 **문제가 요구하는 순서 계약만 정확히 표현**하면 됩니다.

### 문제를 풀 때 확인할 것

1. 정렬 key를 우선순위대로 적습니다.
2. 각 key가 오름차순인지 내림차순인지 표시합니다.
3. subtraction comparator가 overflow될 수 있는지 봅니다.
4. `reversed()`가 전체 comparator를 뒤집는지 특정 key만 뒤집는지 확인합니다.
5. 동점일 때 추가 기준이 필요한지 확인합니다.
6. 직접 만든 comparator가 비교할 때마다 일관된 순서를 반환하는지 봅니다.

### 학습 후 스스로 설명해 보기

Comparator는 두 객체의 순서 관계를 음수·0·양수의 부호로 표현하며 실제 차이값을 반환할 필요는 없습니다. 숫자 비교에서 `a - b`는 overflow 위험이 있어 `Integer.compare`나 `comparingInt` 같은 API가 안전합니다. 여러 정렬 조건은 `thenComparing`으로 표현하고, `reversed()`가 적용되는 범위와 동점 기준을 확인해야 합니다. 직접 만든 comparator는 transitivity를 포함한 일관된 순서 계약도 지켜야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. `return a.score() - b.score();`로 Comparator를 구현하면 왜 위험할 수 있나요?

Comparator에는 실제 차이값이 아니라 순서의 부호만 필요합니다. 두 값의 차이가 `int` 범위를 넘으면 overflow로 부호가 뒤집힐 수 있으므로 `Integer.compare(a.score(), b.score())`나 `Comparator.comparingInt`처럼 overflow 없이 순서를 표현하는 API가 안전합니다.

#### Q. Comparator에서 `compare(a, b) == 0`이면 `a.equals(b)`도 반드시 true인가요?

반드시 그렇지는 않습니다. 예를 들어 점수만 비교하는 comparator에서는 서로 다른 학생도 점수가 같으면 0이 될 수 있습니다. 다만 sorted set/map에서는 comparator의 ordering과 `equals` 불일치가 원소의 동일성처럼 보이는 동작에 영향을 줄 수 있으므로 사용 위치까지 함께 봐야 합니다.
