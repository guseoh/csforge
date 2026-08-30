---
kind: concept
contentKey: java.core.exceptions-resources.autocloseable-resource-ownership
topicContentKey: java.core.exceptions-resources
slug: autocloseable-resource-ownership
title: AutoCloseable과 리소스 소유권
summary: 누가 자원을 열고 닫는지 명확히 해 누수와 이중 종료를 줄인다
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AutoCloseable.html"
    title: AutoCloseable API
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: close 계약과 try-with-resources 대상 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/Closeable.html"
    title: Closeable API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: I/O 자원의 close 계약 확인
---
# AutoCloseable과 소유권

`AutoCloseable`은 `close()`를 제공해 try-with-resources로 자동 종료할 수 있는 자원의 계약입니다. 호출자가 자원을 직접 생성했다면 보통 그 호출자가 닫을 책임을 가집니다. 다른 컴포넌트에서 빌린 자원을 소유하지 않은 코드가 닫으면 재사용 중인 연결을 망가뜨릴 수 있습니다.

```java
final class Cursor implements AutoCloseable {
    @Override public void close() { /* cursor 해제 */ }
}

try (Cursor cursor = openCursor()) {
    consume(cursor);
}
```

`close()`는 여러 번 호출되어도 안전하게 만드는 것이 이상적이지만, 모든 라이브러리의 세부 동작을 추측해서는 안 됩니다. 자원 소유자는 API 문서로 종료 계약을 정하고, 호출자와 반환 객체 사이에 소유권을 명시합니다. Spring 같은 프레임워크가 관리하는 빈·커넥션은 애플리케이션이 임의로 닫지 않는 등 관리 주체도 구분해야 합니다.
