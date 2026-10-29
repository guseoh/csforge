---
kind: concept
contentKey: java.core.streams.stream-reduce
topicContentKey: java.core.streams
slug: stream-reduce
title: "reduce로 여러 값을 하나로 합치기"
summary: "항등값과 결합 연산으로 여러 값을 하나로 축약하는 방식을 이해하고 결합 법칙이 병렬 처리와 결과 안정성에 왜 중요한지 판단한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#reduce(java.lang.Object,java.util.function.BinaryOperator)"
    title: "Java SE 25 API: Stream.reduce"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 항등값과 결합 법칙을 만족하는 누적 연산의 계약을 확인한다.
---
# reduce로 여러 값을 하나로 합치기

여러 원소를 하나의 결과로 모으는 작업을 **축약(reduction)**이라고 합니다. 합계, 최댓값, 문자열 결합처럼 앞의 결과와 다음 원소를 계속 합쳐 하나의 값으로 만들 수 있습니다.

```java
int sum = numbers.stream()
        .reduce(0, Integer::sum);
```

여기서 `0`은 시작값이자 덧셈의 **항등값(identity)** 입니다. `0 + x`가 `x`이므로 부분 결과를 합칠 때도 자연스럽습니다.

### 원소 순서를 유지한 채 묶는 위치를 바꿔도 결과가 같아야 한다

Stream API는 축약 연산에 **결합 법칙(associativity)** 을 요구합니다. 이는 원소의 순서를 바꿔도 된다는 뜻이 아니라, 같은 순서의 원소를 어느 위치에서 먼저 묶어 계산하든 결과가 같아야 한다는 뜻입니다.

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

이 결합 법칙과 올바른 항등값은 순차·병렬 모두에 적용되는 `reduce`의 API 요구입니다. 병렬 스트림에서는 여러 부분을 나눠 계산한 뒤 합치므로 위반이 더 쉽게 드러납니다. 순서에 의존하는 뺄셈을 반드시 왼쪽부터 누적하려면 명시적 반복문으로 계산하고, 특정 JDK의 순차 실행 관찰을 계약 위반 연산의 일반 보장으로 확대하지 않습니다.

### 항등값 자리에 아무 값이나 넣으면 안 된다

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

빈 스트림에는 최댓값이 없으므로 항등값을 억지로 정하지 않고 Optional로 부재를 표현합니다.

### 가변 컬렉션을 reduce로 만들지 않는다

```java
List<Integer> result = numbers.stream()
        .collect(Collectors.toCollection(ArrayList::new));
```

List, Map 같은 가변 결과 컨테이너를 모으는 목적에는 `collect`가 더 적합하도록 설계되어 있습니다. 특히 병렬 수집에서는 공급 함수가 독립된 컨테이너를 만들고 부분 결과를 결합할 수 있습니다. 반면 하나의 가변 List를 reduce의 항등값으로 전달하고 누적 중 직접 변경하면 항등값 자체가 바뀌거나 여러 부분 계산이 같은 객체를 공유하게 됩니다. reduce는 주로 **불변 값 하나로 합치는 연산**에 자연스럽습니다.

### 문제를 풀 때 확인할 것

- 시작값이 정말 그 연산의 항등값인가?
- 누적 연산이 결합 법칙을 만족하는가?
- 빈 스트림일 때 결과를 어떻게 표현해야 하는가?
- 결과가 하나의 값인가, 가변 컨테이너인가?

단순히 `reduce` 문법을 외우기보다 **부분 결과를 어떤 순서로 묶어도 의미가 유지되는가**를 보면 HARD 문제에서도 실수를 줄일 수 있습니다.

업무 초기값이 100이고 나머지 값을 더하는 경우라면, 100을 덧셈의 항등값으로 넣지 말고 항등값 0으로 축약한 결과에 한 번 더합니다. 이렇게 해야 부분 계산마다 초기값이 중복 반영되는 오류를 피할 수 있습니다.
