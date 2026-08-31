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
---
# try-with-resources와 suppressed exception

파일, stream, JDBC connection처럼 사용 후 반드시 정리해야 하는 자원은 정상 처리뿐 아니라 **중간에 예외가 발생해도 닫혀야 합니다.** `try-with-resources`는 `AutoCloseable` 자원의 정리를 언어 수준에서 구조화해 줍니다.

```java
try (BufferedReader reader = Files.newBufferedReader(path)) {
    return reader.readLine();
}
```

블록을 빠져나갈 때 `reader.close()`가 자동으로 수행되므로 여러 return이나 exception 경로마다 `finally`를 직접 작성할 필요가 없습니다.

### 여러 자원은 선언의 역순으로 닫힌다

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

의존하는 자원을 나중에 열고 먼저 닫는 구조를 만들 수 있습니다.

### 본문과 close에서 모두 예외가 나면 어떻게 될까

```java
try (Resource r = open()) {
    throw new WorkException();
} // close()도 CloseException을 던진다고 가정
```

작업 중 발생한 `WorkException`을 덮어쓰고 close 예외만 남긴다면 실제 실패 원인을 잃을 수 있습니다. try-with-resources는 본문의 주 예외를 유지하고 정리 중 발생한 추가 예외를 **suppressed exception**으로 붙일 수 있습니다.

```text
WorkException        ← 주 예외
└─ suppressed
   └─ CloseException ← 정리 중 예외
```

`Throwable.getSuppressed()`로 확인할 수 있습니다.

### close 예외도 무시해도 된다는 뜻은 아니다

suppressed는 중요도가 없다는 뜻이 아니라 **주 예외를 보존하면서 함께 기록하는 방식**입니다. 파일 flush 실패처럼 close 예외가 실제 데이터 손실을 의미할 수도 있으므로 운영 진단에서 확인해야 합니다.

### 실무에서의 기본 선택

직접 획득한 `AutoCloseable` 자원의 범위가 명확하다면 try-with-resources가 좋은 기본 선택입니다. 다만 connection pool이나 framework가 생명주기를 관리하는 객체를 임의로 닫아야 한다는 뜻은 아닙니다. “누가 닫아야 하는가”는 다음 자원 소유권 주제와 연결됩니다.
