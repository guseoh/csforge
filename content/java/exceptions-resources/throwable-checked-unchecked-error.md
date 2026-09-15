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

Java의 예외 계층을 볼 때 가장 먼저 구분할 것은 **컴파일러가 호출자에게 처리나 선언을 강제하는가**입니다. 심각도를 나누는 표가 아니라 언어 수준의 예외 처리 계약으로 이해해야 합니다.

### Throwable 아래에는 Error와 Exception이 있다

```text
Throwable
├─ Error                         ┐
│                               ├─ unchecked
└─ Exception                    │
   ├─ RuntimeException ─────────┘
   │  └─ 여러 unchecked exception
   └─ 그 밖의 여러 checked exception
```

`Exception`의 하위 타입 중 `RuntimeException` 계열이 아닌 checked exception은 메서드 밖으로 전파될 수 있다면 `catch`하거나 `throws`로 선언해야 합니다.

```java
void load() throws IOException {
    Files.readString(path);
}
```

반면 `NullPointerException`, `IllegalArgumentException` 같은 `RuntimeException` 계열과 `Error` 계열은 같은 compile-time checking을 강제받지 않습니다.

### checked와 unchecked는 좋고 나쁨의 구분이 아니다

checked exception은 호출자가 실패 가능성을 컴파일 시점에 인식하게 만들 수 있습니다. 파일 접근 실패처럼 호출자가 다른 경로를 선택하거나 사용자에게 재시도를 요구할 수 있는 API에서는 이 계약이 유용할 수 있습니다.

하지만 호출자가 실제로 복구할 방법이 없는데 모든 계층이 의미 없이 `catch`나 `throws`를 반복하면 실패 책임이 오히려 흐려질 수 있습니다. 반대로 unchecked exception도 잘못된 인자나 상태 계약 위반을 명확하게 표현할 수 있습니다.

따라서 선택 기준은 "checked가 더 안전하다" 또는 "현대 Java에서는 모두 unchecked다"가 아닙니다. **호출자에게 이 실패를 반드시 인식하고 처리하도록 강제하는 것이 API 계약에 도움이 되는가**를 봐야 합니다.

또 checked/unchecked는 심각도 분류도 아닙니다. checked exception이 운영상 치명적일 수도 있고, unchecked exception이 단순 입력 계약 위반일 수도 있습니다.

### Error는 일반적인 비즈니스 복구 흐름과 구분한다

`OutOfMemoryError`, `StackOverflowError` 같은 `Error`는 JVM이나 실행 환경의 심각한 문제를 나타내는 경우가 많습니다. Java 문법상 catch가 불가능한 것은 아니지만, 일반 비즈니스 로직에서 이를 잡아 정상 결과로 바꾸는 설계는 보통 적절하지 않습니다.

중요한 것은 "Error는 무조건 프로세스를 즉시 종료한다"고 외우는 것도, "Throwable이면 모두 같은 방식으로 복구할 수 있다"고 보는 것도 피하는 것입니다.

### 너무 넓은 catch는 실패 의미를 지운다

```java
try {
    process();
} catch (Exception e) {
    return null;
}
```

이 코드는 데이터가 원래 없었던 것인지, 저장소 접근이 실패한 것인지, 프로그래밍 오류가 발생한 것인지 호출자가 구분하기 어렵게 만듭니다.

예외 계층을 배우는 목적은 많이 catch하는 것이 아니라 **어떤 실패를 호출자에게 강제하고, 어떤 실패를 어느 경계에서 복구하거나 변환할지 판단하는 기반**을 만드는 데 있습니다.
