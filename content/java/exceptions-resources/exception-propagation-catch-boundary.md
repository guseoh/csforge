---
kind: concept
contentKey: java.core.exceptions-resources.exception-propagation-catch-boundary
topicContentKey: java.core.exceptions-resources
slug: exception-propagation-catch-boundary
title: "예외 전파와 catch 경계"
summary: "예외를 발생한 곳에서 무조건 잡지 않고 복구·변환·사용자 응답 같은 책임이 있는 경계에서 처리한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.3"
    title: "JLS 11.3 Run-Time Handling of an Exception"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 예외가 적절한 handler를 찾으며 전파되는 실행 규칙 확인
---
# 예외 전파와 catch 경계

예외가 발생한 메서드에서 바로 `catch`해야 한다고 생각하기 쉽지만, 그 위치가 실패를 처리할 책임을 가진 곳이 아닐 수 있습니다. Java는 현재 실행 지점에서 적절한 handler를 찾지 못하면 호출 스택을 따라 예외를 위로 전달합니다.

### 잡는 이유가 없으면 전파하는 편이 낫다

```java
Order load(long id) {
    try {
        return repository.find(id);
    } catch (RuntimeException e) {
        throw e;
    }
}
```

이 `catch`는 아무 복구도, 의미 변환도, 추가 정보도 제공하지 않습니다. 이런 경우에는 그냥 전파하는 편이 더 단순합니다.

예외를 잡을 가치가 있는 대표 이유는 다음과 같습니다.

- 이 위치에서 실제로 **복구**할 수 있다.
- 낮은 수준 실패를 호출자가 이해할 **의미 있는 예외로 변환**한다.
- HTTP 응답처럼 **외부 경계의 실패 표현**으로 바꾼다.
- 자원 정리 같은 책임이 있다. 다만 자원은 try-with-resources가 더 적합할 수 있다.

### 계층별 책임을 나눠 본다

```text
Repository
  │ SQLException 등 낮은 수준 실패
  ▼
Application Service
  │ 필요하면 application 의미로 변환
  ▼
API boundary
  │ HTTP status / error body로 변환
  ▼
Client
```

모든 계층이 같은 예외를 로그로 남기면 한 번의 실패가 여러 줄의 중복 stack trace로 쌓일 수 있습니다. **실제로 운영 판단에 필요한 경계에서 한 번 충분한 정보로 기록**하는 편이 더 나을 수 있습니다.

### 복구는 실제 다음 행동이 있을 때 의미가 있다

```java
try {
    return primary.read();
} catch (TemporaryReadException e) {
    return fallback.read();
}
```

이 코드는 fallback이라는 실제 복구 행동이 있습니다. 반대로 예외를 잡고 빈 목록이나 `null`을 반환하면 호출자가 실패와 정상적인 빈 결과를 구분하지 못할 수 있습니다.

### 트랜잭션 경계와도 연결된다

Spring에서 예외 종류가 rollback 결정에 영향을 줄 수 있지만 그 규칙은 Spring Transaction의 계약입니다. Java 자체에서는 예외 전파가 호출 스택의 제어 흐름을 바꾼다는 점까지만 구분합니다.

### 문제를 풀 때 확인할 것

예외를 어디서 잡아야 하는지 묻는다면 먼저 **그 위치가 무엇을 할 수 있는가**를 보세요. 단순히 예외를 볼 수 있다는 이유로 catch하지 말고, 복구·변환·외부 응답·자원 정리 같은 명확한 책임이 있는지 확인하면 됩니다.
