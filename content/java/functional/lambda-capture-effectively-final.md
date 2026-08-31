---
kind: concept
contentKey: java.core.functional.lambda-capture-effectively-final
topicContentKey: java.core.functional
slug: lambda-capture-effectively-final
title: "Lambda의 지역 변수 캡처와 effectively final"
summary: "lambda가 바깥 지역 변수를 사용할 때 final 또는 사실상 final이어야 하는 규칙과 참조 객체 상태 변경을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27.2"
    title: "JLS 15.27.2 Lambda Body"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: lambda에서 지역 변수 캡처와 effectively final 관련 규칙 확인
---
# Lambda의 지역 변수 캡처와 effectively final

lambda 본문에서는 바깥 메서드의 지역 변수를 읽을 수 있습니다.

```java
int minimum = 100;
Predicate<Integer> enough = value -> value >= minimum;
```

`minimum`에 명시적인 `final`이 없지만 선언 뒤 다시 대입되지 않았기 때문에 **사실상 final(effectively final)** 로 취급됩니다.

### 다시 대입하면 캡처할 수 없다

```java
int minimum = 100;
minimum = 200;

// Predicate<Integer> enough = value -> value >= minimum;
```

이 지역 변수는 값이 다시 바뀌었으므로 effectively final이 아닙니다. Java는 lambda가 캡처하는 local variable에 이런 제한을 둡니다.

### 참조가 final이어도 객체 상태는 바뀔 수 있다

여기서 `final`의 의미를 다시 구분해야 합니다.

```java
List<String> names = new ArrayList<>();
Runnable task = () -> names.add("java");
```

`names` 변수 자체는 다시 대입되지 않으므로 effectively final입니다. 하지만 그 참조가 가리키는 `ArrayList`는 가변 객체라 `add()`할 수 있습니다.

```text
captured local reference
names ─────> ArrayList
   X 재대입      │
                 └─ 내부 상태 변경 가능
```

즉 **캡처된 변수의 재대입 제한과 객체 불변성은 다른 문제**입니다.

### 배열 하나로 우회하는 코드는 위험 신호일 수 있다

```java
int[] count = {0};
values.forEach(v -> count[0]++);
```

컴파일은 되지만 lambda 바깥의 가변 상태를 우회해서 변경합니다. 특히 parallel stream이나 여러 스레드에서 실행되면 race condition으로 이어질 수 있습니다.

단순 합계라면 `mapToInt().sum()`이나 collector처럼 상태 변경을 외부에 노출하지 않는 API가 더 명확할 수 있습니다.

### 왜 이런 규칙이 필요한가

지역 변수는 메서드 호출의 실행 범위와 연결되지만 lambda 객체는 그 메서드가 끝난 뒤에도 사용될 수 있습니다. Java는 지역 변수의 변하는 저장 위치를 lambda와 공유하는 모델 대신 **캡처할 값이 안정적으로 정해져 있는 형태**를 사용합니다.

정확한 JVM 구현 방식은 언어 규칙과 구분해야 합니다. 학습의 핵심은 local variable capture가 final/effectively final을 요구한다는 계약입니다.

### 문제를 풀 때 확인할 것

- lambda가 바깥의 필드인가 지역 변수인가를 사용하고 있는가?
- 지역 변수라면 선언 뒤 재대입되는가?
- 참조 변수는 고정되어도 가리키는 객체가 mutable한가?
- 그 가변 상태를 여러 실행 흐름에서 공유하게 되지는 않는가?

이 네 가지를 나누면 캡처와 동시성 문제를 섞지 않게 됩니다.
