---
kind: concept
contentKey: java.core.exceptions-resources.finally-try-resources
topicContentKey: java.core.exceptions-resources
slug: finally-try-resources
title: finally와 try-with-resources
summary: 예외가 발생해도 정리 작업을 보장하고 suppressed exception을 이해한다
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html"
    title: "Java Language Specification 14장: Blocks, Statements, and Patterns"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: try-finally와 try-with-resources 문법 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html"
    title: Throwable API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: suppressed exception 조회 확인
---
# finally와 try-with-resources

`finally` 블록은 정상 종료와 예외 종료에서 공통으로 실행할 정리 코드를 두는 전통적인 방식입니다. 다만 `return`이나 예외가 finally에서 다시 발생하면 원래 결과·예외가 가려질 수 있고, 여러 자원을 역순으로 닫는 코드를 직접 관리해야 합니다.

`try-with-resources`는 `AutoCloseable` 자원을 선언하고 블록이 끝날 때 자동으로 닫습니다. 본문에서 예외가 먼저 발생하고 close에서도 예외가 발생하면 본문의 예외가 주 예외로 남고 close 예외는 suppressed exception으로 연결됩니다.

```java
try (InputStream input = Files.newInputStream(path)) {
    return input.read();
}
```

리소스 정리의 성공 여부가 업무 실패보다 중요한 특수한 경우가 아니라면 close 예외를 조용히 버리지 말고 원인과 함께 관찰할 수 있게 합니다. 일반 파일·소켓·DB 자원은 가능한 한 try-with-resources로 소유권과 종료 시점을 표현합니다.
