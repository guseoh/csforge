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

"점수는 높은 순서, 점수가 같으면 이름은 사전순"처럼 여러 정렬 조건이 주어지면 먼저 **정렬 key를 우선순위대로 적고 각 방향을 표시**하는 것이 가장 중요합니다. 그 순서를 그대로 Comparator에 옮기면 됩니다.

### Comparator는 실제 차이보다 순서의 부호를 표현한다

```text
음수 -> 첫 번째 값이 앞
0    -> 현재 비교 기준에서 동점
양수 -> 첫 번째 값이 뒤
```

따라서 다음처럼 뺄셈으로 비교하는 것은 피하는 편이 안전합니다.

```java
Comparator<Integer> unsafe = (a, b) -> a - b;
```

두 값의 차이가 `int` 범위를 넘으면 overflow로 부호가 뒤집힐 수 있습니다.

```java
Comparator<Integer> safe = Integer::compare;
```

객체의 숫자 필드도 `Integer.compare`, `Long.compare`, `comparingInt`, `comparingLong` 같은 API로 표현할 수 있습니다.

### 다중 조건은 `thenComparing` 순서가 문제 조건의 우선순위다

```java
record Student(String name, int score, int age) { }

Comparator<Student> order = Comparator
        .comparingInt(Student::score)
        .reversed()
        .thenComparing(Student::name)
        .thenComparingInt(Student::age);
```

이 코드는 다음 문제 조건을 그대로 나타냅니다.

```text
1. score 내림차순
2. 동점이면 name 오름차순
3. 그래도 같으면 age 오름차순
```

`thenComparing`은 앞선 기준이 0일 때 다음 기준을 적용합니다. 따라서 문제에서 요구하는 tie-breaker가 있다면 빠뜨리지 않아야 합니다.

### `reversed()`가 뒤집는 범위를 확인한다

```java
Comparator<Student> all = Comparator
        .comparingInt(Student::score)
        .thenComparing(Student::name)
        .reversed();
```

마지막 `reversed()`는 이미 만들어진 **전체 comparator**를 뒤집습니다. "score만 내림차순, name은 오름차순"이 목적이라면 score 기준을 먼저 뒤집고 다음 조건을 이어야 합니다.

```java
Comparator<Student> wanted = Comparator
        .comparingInt(Student::score)
        .reversed()
        .thenComparing(Student::name);
```

### Comparator의 0은 객체가 완전히 같다는 뜻이 아니다

```java
Comparator<Student> byScore =
        Comparator.comparingInt(Student::score);
```

서로 다른 학생도 점수가 같으면 비교 결과가 0일 수 있습니다. 단순 정렬에서는 "현재 기준으로 동점"이라는 의미입니다.

문제에서 동점 출력 순서까지 정했다면 name이나 id 같은 추가 기준을 comparator에 포함해야 합니다. 반대로 동점 순서가 상관없다고 명시됐다면 불필요한 tie-breaker를 만들 필요는 없습니다.

Comparator 문제를 풀 때는 **정렬 key 순서 → 각 key의 오름/내림차순 → 동점 기준 → overflow 위험 → reversed 범위**만 차례로 확인하면 됩니다. Comparator의 일반 계약 자체는 앞선 객체 계약 Topic에서 다루었으므로 여기서는 문제 문장을 정확한 Java 정렬 코드로 옮기는 데 집중합니다.
