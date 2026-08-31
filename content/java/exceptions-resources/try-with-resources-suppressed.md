---
kind: concept
contentKey: java.core.exceptions-resources.try-with-resources-suppressed
topicContentKey: java.core.exceptions-resources
slug: try-with-resources-suppressed
title: "Try-with-resources and suppressed exceptions"
summary: "자원을 역순으로 닫고 주 예외와 close 예외를 함께 보존한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html"
    title: "Java Language Specification 14장: Blocks, Statements, and Patterns"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: try-with-resources 실행 순서와 예외 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html"
    title: "Java SE 25 API: Throwable"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: suppressed exception 조회 확인
---
# Try-with-resources and suppressed exceptions

## 쉬운 진입

파일을 읽다가 본문 처리도 실패하고 닫는 작업도 실패할 수 있다. 어느 예외를 주된 실패로
보여 줄지와 다른 예외를 버리지 않을지가 중요하다. try-with-resources는 이 보일러플레이트를
언어 차원에서 정리한다.

## 정확한 메커니즘

resource expression은 `AutoCloseable`이어야 하며 선언된 자원은 scope를 벗어날 때 닫힌다.
여러 자원은 선언의 역순으로 close된다. 본문에서 예외가 먼저 발생하면 그 예외가 주 예외가
되고, close 중 예외는 주 예외의 suppressed 목록에 붙는다. 본문이 정상인데 close만 실패하면
close 예외가 주 예외가 된다.

```text
open A -> open B -> body
                    │
             close B -> close A
             (close failure는 주 예외에 suppressed)
```

## 실전·면접 연결

resource를 직접 획득한 scope가 try-with-resources의 owner가 되는지 확인해야 한다. 외부에서
빌린 자원을 무조건 닫으면 소유자의 후속 사용을 깨뜨릴 수 있다. `getSuppressed()`는 원인
조사와 테스트에서 close 실패를 확인하는 유용한 단서다.

## 흔한 오해

- close 예외가 항상 본문 예외를 덮어쓰는 것은 아니다.
- 선언 순서와 close 순서는 같다지 않다.
- try-with-resources가 임의의 객체나 OS 파일 descriptor의 소유권까지 자동으로 판단하지는 않는다.
