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
    title: "JDK 7"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: try-with-resources와 JDK 7 자원 관리 문법을 한국어 사례로 보충
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

### 자원을 여는 중간에도 실패할 수 있다

두 번째 자원을 열다가 실패하면 첫 번째 자원을 그대로 남겨 두면 안 됩니다. try-with-resources는 이미 성공적으로 초기화된 자원에 대해서는 정리 경로를 적용합니다.

```text
open first  성공
   ↓
open second 실패
   ↓
close first
   ↓
예외 전파
```

따라서 “try block 본문까지 들어갔을 때만 close된다”라고 이해하면 부족합니다. **어디까지 자원 초기화가 성공했는지**도 자원 수명 추적의 일부입니다.

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

반대로 본문에서는 정상 종료했고 `close()`에서만 예외가 발생했다면 그 close 예외가 단순 suppressed로만 숨겨지는 것이 아니라 밖으로 전파될 수 있습니다. suppressed는 **이미 주 예외가 존재하는 상황에서 추가 정리 실패를 함께 보존하는 구조**로 이해해야 합니다.

### close 예외도 무시해도 된다는 뜻은 아니다

suppressed는 중요도가 없다는 뜻이 아니라 **주 예외를 보존하면서 함께 기록하는 방식**입니다. 파일 flush 실패처럼 close 예외가 실제 데이터 손실을 의미할 수도 있으므로 운영 진단에서 확인해야 합니다.

### 실무에서의 기본 선택

직접 획득한 `AutoCloseable` 자원의 범위가 명확하다면 try-with-resources가 좋은 기본 선택입니다. 다만 connection pool이나 framework가 생명주기를 관리하는 객체를 임의로 닫아야 한다는 뜻은 아닙니다. “누가 닫아야 하는가”는 자원 소유권 주제와 연결됩니다.

### 면접에서 이렇게 나옵니다

#### Q. try-with-resources에서 본문 예외와 `close()` 예외가 동시에 발생하면 어떤 예외가 전달되나요?

본문에서 발생한 예외가 주 예외로 유지되고, 자원 정리 중 발생한 예외는 suppressed exception으로 연결될 수 있습니다. 그래서 본래 작업 실패의 stack trace를 잃지 않으면서 정리 실패도 `getSuppressed()`로 확인할 수 있습니다.

#### Q. 여러 자원을 선언하면 어떤 순서로 닫히나요?

선언한 순서의 역순으로 닫힙니다. 첫 번째 자원을 연 뒤 두 번째 자원을 열었으면 종료 시 두 번째를 먼저 닫고 첫 번째를 나중에 닫습니다. 자원 초기화 도중 실패한 경우에도 이미 성공적으로 열린 앞선 자원의 정리 여부를 함께 추적해야 합니다.
