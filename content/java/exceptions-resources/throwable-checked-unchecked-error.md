---
kind: concept
contentKey: java.core.exceptions-resources.throwable-checked-unchecked-error
topicContentKey: java.core.exceptions-resources
slug: throwable-checked-unchecked-error
title: "Throwable, checked exception, unchecked exception과 Error"
summary: "Java 예외 계층을 컴파일러 검사 관점에서 구분하고 checked와 unchecked를 단순한 좋고 나쁨으로 판단하지 않는다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html"
    title: "JLS 11 Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: checked/unchecked exception의 언어 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html"
    title: "Java SE 25 API: Throwable"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Throwable 계층의 기본 계약 확인
---
# Throwable, checked exception, unchecked exception과 Error

Java에서 문제가 발생하면 모두 같은 방식으로 처리하는 것이 아닙니다. 예외 계층을 이해할 때 가장 중요한 기준은 **컴파일러가 호출자에게 처리나 선언을 요구하는가**, 그리고 **그 문제가 일반 애플리케이션 코드가 복구 대상으로 다루기 적절한가**입니다.

### Throwable 아래에는 Error와 Exception이 있다

개념적으로 큰 구조는 다음과 같습니다.

```text
Throwable
├─ Error
└─ Exception
   ├─ RuntimeException
   │  └─ 여러 unchecked exception
   └─ 그 밖의 여러 checked exception
```

`Exception`의 하위 타입 중 `RuntimeException` 계열이 아닌 checked exception은 메서드 밖으로 전달할 수 있을 때 `throws`로 선언하거나 `catch`해야 합니다.

```java
void load() throws IOException {
    Files.readString(path);
}
```

반면 `NullPointerException`, `IllegalArgumentException` 같은 `RuntimeException` 계열은 컴파일러가 같은 방식으로 강제하지 않습니다.

### checked가 더 안전하고 unchecked가 더 나쁜 것은 아니다

checked exception은 호출자가 실패 가능성을 컴파일 시점에 인식하도록 만들 수 있습니다. 파일 열기처럼 호출자가 대안을 선택하거나 사용자에게 다시 입력을 요청할 수 있는 실패에는 유용할 수 있습니다.

하지만 호출자마다 의미 없는 `catch`나 `throws`를 반복하게 만들면 오히려 실제 복구 책임이 흐려질 수 있습니다. 반대로 unchecked exception도 입력 계약 위반이나 프로그래밍 오류를 명확하게 표현할 수 있습니다.

선택 기준은 “무조건 checked”나 “현대 Java는 전부 unchecked”가 아니라 **호출자가 이 실패를 합리적으로 복구하도록 강제하는 것이 API 계약에 도움이 되는가**입니다.

### Error는 보통 일반 복구 흐름으로 잡지 않는다

`OutOfMemoryError`, `StackOverflowError` 같은 `Error` 계열은 JVM이나 실행 환경의 심각한 문제를 나타내는 경우가 많습니다. 비즈니스 로직에서 `catch (Error e)`로 잡아 정상 처리로 돌리는 것은 일반적인 설계가 아닙니다.

그렇다고 모든 `Error`가 프로세스를 즉시 종료한다는 언어 규칙이 있는 것은 아닙니다. 핵심은 애플리케이션 수준의 정상 예외 처리 계약과 구분하는 것입니다.

### `catch (Exception)`이 편해 보여도 정보가 사라진다

```java
try {
    process();
} catch (Exception e) {
    return null;
}
```

이 코드는 서로 다른 실패 원인을 모두 같은 방식으로 숨깁니다. 호출자는 데이터가 원래 없었던 것인지, DB 연결이 실패했는지, 코드 버그가 있었는지 구분할 수 없습니다.

예외 계층을 이해하는 목적은 많이 잡는 것이 아니라 **어떤 실패를 어디에서 어떤 의미로 처리할지 결정하는 것**입니다.

### 면접에서 설명한다면

checked exception은 컴파일러가 처리 또는 선언을 요구하는 예외이고, `RuntimeException`과 `Error` 계열은 unchecked입니다. 그러나 checked/unchecked 선택은 심각도 순위가 아니라 API가 호출자에게 복구 책임을 어떻게 표현할지에 관한 설계 문제라고 설명하면 좋습니다.
