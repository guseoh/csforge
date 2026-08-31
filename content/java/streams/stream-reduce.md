---
kind: concept
contentKey: java.core.streams.stream-reduce
topicContentKey: java.core.streams
slug: stream-reduce
title: "reduce로 여러 값을 하나로 합치기"
summary: "identity와 결합 연산을 이용한 reduction을 이해하고 결합 법칙이 병렬 처리와 결과 안정성에 왜 중요한지 판단한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#reduce(java.lang.Object,java.util.function.BinaryOperator)"
    title: "Java SE 25 API: Stream.reduce"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: identity와 associative accumulator 계약 확인
---
# reduce로 여러 값을 하나로 합치기

여러 원소를 하나의 결과로 모으는 작업을 **reduction**이라고 합니다. 합계, 최댓값, 문자열 결합처럼 앞의 결과와 다음 원소를 계속 합쳐 하나의 값으로 만들 수 있습니다.

```java
int sum = numbers.stream()
        .reduce(0, Integer::sum);
```

여기서 `0`은 시작값이자 덧셈의 **항등값(identity)** 입니다. `0 + x`가 `x`이므로 부분 결과를 합칠 때도 자연스럽습니다.

### 연산은 순서를 바꿔 묶어도 같은 결과여야 한다

Stream API는 reduction 연산에 **결합 가능성(associativity)** 을 중요하게 요구합니다.

덧셈은 다음 두 식이 같은 결과를 냅니다.

```text
(a + b) + c
 a + (b + c)
```

반면 뺄셈은 그렇지 않습니다.

```text
(10 - 3) - 2 = 5
10 - (3 - 2) = 9
```

병렬 stream에서는 여러 부분을 나눠 계산한 뒤 합칠 수 있기 때문에 결합 순서가 달라져도 결과가 같아야 안정적입니다.

### identity를 아무 값이나 넣으면 안 된다

곱셈의 항등값은 `1`입니다.

```java
int product = numbers.stream()
        .reduce(1, (a, b) -> a * b);
```

시작값을 `0`으로 넣으면 모든 결과가 0이 되어 의미가 달라집니다.

### 값이 없을 수 있으면 Optional 결과가 자연스럽다

```java
Optional<Integer> max = numbers.stream()
        .reduce(Integer::max);
```

빈 stream에는 최댓값이 없으므로 identity를 억지로 정하지 않고 Optional로 부재를 표현합니다.

### mutable collection을 reduce로 만들지 않는다

```java
// 좋지 않은 예: 같은 mutable List를 누적하며 reduce
```

List, Map 같은 가변 결과 컨테이너를 모으는 목적에는 `collect`가 더 적합하도록 설계되어 있습니다. reduce는 주로 **불변 값 하나로 합치는 연산**에 자연스럽습니다.

### 문제를 풀 때 확인할 것

- identity가 정말 그 연산의 항등값인가?
- accumulator가 결합 가능한가?
- 빈 stream일 때 결과를 어떻게 표현해야 하는가?
- 결과가 하나의 값인가, 가변 컨테이너인가?

단순히 `reduce` 문법을 외우기보다 **부분 결과를 어떤 순서로 묶어도 의미가 유지되는가**를 보면 HARD 문제에서도 실수를 줄일 수 있습니다.
