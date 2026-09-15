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

lambda 본문에서는 바깥 메서드의 지역 변수를 사용할 수 있습니다.

```java
int minimum = 100;
Predicate<Integer> enough = value -> value >= minimum;
```

`minimum`에 명시적인 `final`은 없지만 선언 뒤 다시 대입되지 않았기 때문에 **사실상 final(effectively final)** 로 취급됩니다.

### 다시 대입되는 지역 변수는 캡처할 수 없다

```java
int minimum = 100;
minimum = 200;

// Predicate<Integer> enough = value -> value >= minimum;
```

이 지역 변수는 effectively final이 아닙니다. 기준은 "lambda를 만든 뒤부터 바꾸지 않는다"가 아니라 **해당 지역 변수가 언어 규칙상 final 또는 effectively final인가**입니다.

### 참조 변수의 고정과 객체 불변성은 다르다

```java
List<String> names = new ArrayList<>();
Runnable task = () -> names.add("java");
```

`names` 변수 자체는 다시 대입되지 않으므로 캡처할 수 있습니다. 하지만 그 참조가 가리키는 `ArrayList`는 가변 객체이므로 `add()`할 수 있습니다.

```text
captured local reference
names ─────> ArrayList
   X 재대입      │
                 └─ 내부 상태 변경 가능
```

즉 **캡처된 지역 변수의 재대입 제한과 참조 객체의 불변성은 별개의 문제**입니다. lambda가 참조를 캡처한다고 해서 객체 상태가 깊은 복사로 고정되는 것도 아닙니다.

### 가변 holder로 우회하면 규칙의 의미를 잃을 수 있다

```java
int[] count = {0};
values.forEach(v -> count[0]++);
```

배열 참조 `count`는 재대입되지 않으므로 컴파일됩니다. 하지만 실제로는 바깥의 가변 상태를 lambda에서 수정하고 있습니다. 단순 합계라면 `sum()`이나 collector처럼 외부 mutation이 없는 표현이 더 명확할 수 있습니다.

여러 스레드에서 같은 가변 객체를 공유할 때의 가시성·원자성 문제는 effectively final 규칙이 해결해 주지 않습니다. 그 부분은 동시성 Topic의 별도 계약입니다.

### 반복 변수는 각 반복의 새 지역 값으로 분리할 수 있다

일반적인 `for`문의 증감 변수는 계속 재대입되므로 그대로 캡처할 수 없습니다.

```java
List<Runnable> tasks = new ArrayList<>();
for (int i = 0; i < 3; i++) {
    int index = i;
    tasks.add(() -> System.out.println(index));
}
```

각 반복에서 새로 선언되는 `index`는 다시 대입되지 않으므로 캡처할 수 있습니다.

lambda capture를 이해할 때 특정 JVM의 메모리 표현부터 상상할 필요는 없습니다. **바깥 지역 변수는 final 또는 effectively final이어야 하고, 참조가 고정되어도 가리키는 객체 상태는 별도로 바뀔 수 있다**는 언어 계약을 먼저 잡으면 됩니다.
