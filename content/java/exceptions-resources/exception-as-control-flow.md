---
kind: concept
contentKey: java.core.exceptions-resources.exception-as-control-flow
topicContentKey: java.core.exceptions-resources
slug: exception-as-control-flow
title: "예외와 정상적인 분기 흐름 구분하기"
summary: "예상되는 정상 분기를 반복적인 exception 발생으로 표현할 때 의미와 성능이 나빠질 수 있는 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html"
    title: "JLS 11 Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 예외가 정상 순차 실행을 갑자기 바꾸는 제어 흐름임을 확인
---
# 예외와 정상적인 분기 흐름 구분하기

예외는 정상적인 실행을 계속할 수 없는 상황을 호출자에게 전달하는 강력한 수단입니다. 하지만 **자주 발생하는 정상 조건을 검사하는 대신 일부러 예외를 발생시켜 분기**하면 코드의 의도가 흐려질 수 있습니다.

### 정상 종료 조건을 예외로 표현한 예

```java
for (int i = 0; ; i++) {
    try {
        process(values.get(i));
    } catch (IndexOutOfBoundsException e) {
        break;
    }
}
```

이 코드는 목록 끝에 도달하는 것이 정상적인 반복 종료 조건인데 예외로 표현합니다.

```java
for (int i = 0; i < values.size(); i++) {
    process(values.get(i));
}
```

두 번째가 “범위 안의 원소를 처리한다”는 의도를 훨씬 직접적으로 보여 줍니다.

### 실패와 부재를 구분해야 한다

Map에서 key가 없는 것은 많은 경우 정상적으로 예상할 수 있는 상황입니다.

```java
Value value = map.get(key);
if (value == null) {
    // 부재 처리
}
```

반대로 반드시 존재해야 한다는 계약인데 없으면 시스템 상태가 잘못된 것일 수 있어 예외가 자연스러울 수 있습니다. 즉 같은 “값 없음”도 API 계약에 따라 정상 분기인지 예외 상황인지 달라집니다.

### 성능보다 의미를 먼저 본다

예외 생성은 stack trace 수집 등 일반 조건문보다 비용이 클 수 있습니다. 하지만 “예외는 느리다”만 외워 모든 예외를 반환 코드로 바꾸는 것도 좋은 설계는 아닙니다.

핵심은 **일상적으로 예상되는 흐름인가, 계약을 벗어난 실패인가**입니다. 성능이 중요한 hot path에서 예외가 대량으로 발생한다면 실제 측정으로 비용도 확인해야 합니다.

### API가 이미 예외 기반 계약을 제공할 수도 있다

`Integer.parseInt`는 잘못된 숫자 문자열에 `NumberFormatException`을 던집니다. 호출자가 입력을 받는 경계에서는 이를 적절히 검증하거나 예외를 변환해야 할 수 있습니다. “예외를 제어 흐름에 쓰지 말라”는 원칙이 라이브러리 예외를 절대 catch하지 말라는 뜻은 아닙니다.

### 판단 질문

- 이 상황은 정상 실행 중 자주 발생할 것으로 예상되는가?
- 호출자가 이 상황을 값이나 조건으로 자연스럽게 처리할 수 있는가?
- 예외가 실제 계약 위반이나 실패를 더 분명하게 표현하는가?

예외를 쓰는지 여부는 문법 취향보다 **API 의미를 어떻게 표현할지**의 문제입니다.
