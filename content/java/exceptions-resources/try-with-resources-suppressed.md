---
kind: concept
contentKey: java.core.exceptions-resources.try-with-resources-suppressed
topicContentKey: java.core.exceptions-resources
slug: try-with-resources-suppressed
title: "try-with-resources와 suppressed exception"
summary: "자동 자원 정리 순서와 본문 예외와 close 예외가 동시에 발생할 때 suppressed로 원인을 보존하는 방식을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3"
    title: "JLS 14.20.3 try-with-resources"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 자원 자동 정리와 suppressed exception 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html#getSuppressed()"
    title: "Java SE 25 API: Throwable.getSuppressed"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: suppressed exception 조회 계약 확인
  - url: "https://d2.naver.com/helloworld/1219"
    title: "네이버 D2: JDK 7의 NIO.2와 파일 API"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: try-with-resources와 JDK 7 자원 관리 문법을 한국어 사례로 보충
---
# try-with-resources와 suppressed exception

파일, stream, JDBC connection처럼 사용 후 정리가 필요한 자원은 정상 종료뿐 아니라 **중간에 예외가 발생해도 닫혀야 합니다.** `try-with-resources`는 `AutoCloseable` 자원의 수명을 언어 구조 안에 넣어 이런 정리 경로를 관리합니다.

```java
try (BufferedReader reader = Files.newBufferedReader(path)) {
    return reader.readLine();
}
```

블록을 빠져나갈 때 `reader.close()`가 자동으로 수행되므로 여러 `return`이나 예외 경로마다 `finally`를 직접 반복할 필요가 없습니다.

### 여러 자원은 선언한 순서의 역순으로 닫힌다

```java
try (
    Resource first = openFirst();
    Resource second = openSecond()
) {
    use(first, second);
}
```

종료 시에는 `second`가 먼저, `first`가 나중에 닫힙니다.

```text
open first
   ↓
open second
   ↓
use
   ↓
close second
   ↓
close first
```

두 번째 자원을 여는 도중 실패해도 이미 성공적으로 초기화된 첫 번째 자원은 정리 대상이 됩니다. 따라서 "try 본문까지 들어가야만 close된다"고 이해하면 부족합니다.

### 본문 예외와 close 예외가 동시에 발생할 수 있다

```java
try (Resource r = open()) {
    throw new WorkException();
} // close()도 CloseException을 던진다고 가정
```

본문에서 발생한 `WorkException`을 정리 중 예외가 덮어쓰면 실제 작업 실패 원인을 잃게 됩니다. try-with-resources는 본문의 주 예외를 유지하고, close 중 발생한 추가 예외를 **suppressed exception**으로 연결할 수 있습니다.

```text
WorkException        ← 주 예외
└─ suppressed
   └─ CloseException ← 정리 중 예외
```

추가 예외는 `Throwable.getSuppressed()`로 확인할 수 있습니다.

반대로 본문이 정상 완료되고 `close()`에서만 예외가 발생했다면 그 close 예외가 밖으로 전파될 수 있습니다. suppressed는 "close 예외는 중요하지 않다"는 뜻이 아니라 **이미 주 예외가 있을 때 정리 실패도 함께 보존하는 방식**입니다.

### 자원 관리와 자원 소유권은 함께 봐야 한다

직접 획득한 `AutoCloseable` 자원의 사용 범위가 명확하다면 try-with-resources가 좋은 기본 선택입니다. 하지만 framework나 다른 호출자가 생명주기를 소유하는 자원까지 현재 코드가 임의로 닫아야 한다는 뜻은 아닙니다.

그래서 try-with-resources를 사용할 때는 두 가지를 함께 확인하면 됩니다. **이 코드가 자원의 소유자인가**, 그리고 **정상·실패 어느 경로에서도 소유한 자원을 정리하는가**입니다. 정리 중 발생한 추가 실패까지 보존해야 할 때 suppressed exception 규칙이 의미를 가집니다.
