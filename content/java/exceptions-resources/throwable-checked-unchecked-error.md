---
kind: concept
contentKey: java.core.exceptions-resources.throwable-checked-unchecked-error
topicContentKey: java.core.exceptions-resources
slug: throwable-checked-unchecked-error
title: "Throwable, checked, unchecked, and Error"
summary: "Throwable 계층과 checked·unchecked·Error를 compiler checking 관점에서 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html"
    title: "Java Language Specification 11장: Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: checked exception과 예외 처리·검사 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html"
    title: "Java SE 25 API: Throwable"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Throwable 계층과 cause·suppressed 상태 확인
---
# Throwable, checked, unchecked, and Error

## 쉬운 진입

프로그램 실행 중 문제가 생겼다고 해서 모두 같은 종류의 문제는 아니다. 호출자가 복구를
검토해야 하는 외부 실패와, 호출 방식이 잘못되어 고쳐야 하는 프로그래밍 오류, JVM이 더 이상
정상 동작하기 어려운 상태를 구분하면 예외 계약이 선명해진다.

## 정확한 메커니즘

`Throwable`은 Java에서 던지고 잡을 수 있는 최상위 타입이다. 일반 애플리케이션 예외는
대부분 `Exception` 아래에 두며, `RuntimeException`과 그 하위 타입은 unchecked라서 compiler가
`catch` 또는 `throws` 선언을 강제하지 않는다. 그 밖의 `Exception` 하위 타입은 checked라서
메서드가 던질 수 있음을 처리하거나 선언해야 한다. `Error`도 `Throwable`의 별도 가지이며,
`OutOfMemoryError`처럼 애플리케이션이 보통 복구를 책임질 대상으로 설계되지 않는다.

```java
void load() throws IOException { // checked: 호출자가 계약을 처리해야 한다
    throw new IOException();
}

void requireName(String name) {
    if (name == null) throw new NullPointerException("name"); // unchecked
}
```

## 실전·면접 연결

checked 여부는 “좋은 예외/나쁜 예외” 평가가 아니라 compiler가 호출 경계에서 처리를
확인할지의 문제다. 파일·네트워크처럼 호출자가 복구 전략을 선택할 여지가 있는 실패는 checked가
자연스러울 수 있고, 잘못된 인자나 불변식 위반은 unchecked가 자연스럽다. `Error`를 무조건
잡아 정상 흐름으로 바꾸면 오히려 손상을 키울 수 있다.

## 흔한 오해

- `RuntimeException`은 예외가 아니거나 던질 수 없는 타입이 아니다.
- `throws RuntimeException`을 쓰면 checked가 되지 않는다.
- 모든 `Error`가 즉시 프로세스를 종료한다는 Java 언어 보장은 없다. 다만 일반 복구 계약으로 삼기 어렵다.
