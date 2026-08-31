---
kind: concept
contentKey: java.core.exceptions-resources.exception-propagation-catch-boundary
topicContentKey: java.core.exceptions-resources
slug: exception-propagation-catch-boundary
title: "Exception propagation and catch boundaries"
summary: "복구 책임이 있는 경계에서 예외를 처리하고 불필요한 catch를 피한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html"
    title: "Java Language Specification 11장: Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 예외 발생과 호출 스택 전파 규칙 확인
---
# Exception propagation and catch boundaries

## 쉬운 진입

예외를 발견한 모든 메서드가 즉시 잡아 버리면 어디서 문제가 복구됐는지 알 수 없고, 반대로
모든 계층이 같은 예외를 다시 던지면 사용자에게 필요한 의미가 사라진다. 예외가 전파되는
경로와 실제 책임이 만나는 경계를 분리해서 설계해야 한다.

## 정확한 메커니즘

현재 메서드에 맞는 `catch`가 없으면 예외는 호출자 방향으로 전파된다. `catch`는 타입이
할당 가능한지에 따라 선택되므로 구체적인 예외를 넓은 예외보다 먼저 둔다. 복구할 수 없는
예외를 잡을 때는 원인과 context를 보존하고, 처리할 책임이 없는 계층에서는 그대로 전파하는
편이 낫다.

```text
repository IOException
        │  (복구/번역 없음)
application service ── 의미 있는 예외로 번역
        │
HTTP boundary ── 사용자 응답·상태 코드로 변환
```

## 실전·면접 연결

재시도, fallback, transaction rollback 같은 정책을 실제로 결정할 수 있는 계층이 catch
boundary다. 로그를 모든 계층에서 중복으로 남기면 같은 오류가 여러 번 기록된다. 예외를
잡아서 `null`이나 빈 결과로 바꾸는 것은 호출자에게 실패를 숨기는 행위이므로 계약으로 명시할
수 있을 때만 선택한다.

## 흔한 오해

- catch했다고 예외의 원인이 자동으로 기록되거나 해결되는 것은 아니다.
- `catch (Exception)`은 모든 `Throwable`을 잡지 않으며 `Error`까지 처리하는 만능 경계도 아니다.
- stack trace를 잃은 채 새 예외만 만들면 장애 원인 추적이 어려워진다.
