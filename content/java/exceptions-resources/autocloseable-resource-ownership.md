---
kind: concept
contentKey: java.core.exceptions-resources.autocloseable-resource-ownership
topicContentKey: java.core.exceptions-resources
slug: autocloseable-resource-ownership
title: "AutoCloseable and resource ownership"
summary: "획득·대여 계약에 따라 자원을 해제할 책임을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AutoCloseable.html"
    title: "Java SE 25 API: AutoCloseable"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: close 계약과 예외 의미 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/Closeable.html"
    title: "Java SE 25 API: Closeable"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: I/O 자원의 close 계약 확인
---
# AutoCloseable and resource ownership

## 쉬운 진입

자원을 닫는 시점은 “사용이 끝났는가”뿐 아니라 “누가 만들었고 누가 소유하는가”의 문제다.
메서드가 reader를 새로 열었다면 보통 그 메서드가 닫을 책임을 갖지만, 호출자가 전달한
공유 stream을 단순히 빌린 것이라면 닫지 않는 계약이 더 맞을 수 있다.

## 정확한 메커니즘

`AutoCloseable`은 `close()`를 제공해 try-with-resources에 참여하는 계약이다. `Closeable`은
I/O 자원에 특화된 하위 계약으로 `IOException`을 사용한다. 구현체가 close를 여러 번 받아도
안전한지, close 후 어떤 메서드가 금지되는지, close 예외를 어떻게 다루는지는 각 API의 문서가
정한다.

```java
static String readOwnFile(Path path) throws IOException {
    try (Reader reader = Files.newBufferedReader(path, UTF_8)) {
        return readAll(reader);
    } // 이 메서드가 획득했으므로 여기서 close
}
```

## 실전·면접 연결

owner와 borrower를 API 이름·문서·scope로 드러내면 double-close와 premature-close를 줄일 수
있다. wrapper가 underlying resource를 닫는지, flush가 필요한 writer인지도 함께 확인한다.
framework의 lifecycle callback이 ownership을 맡는다면 애플리케이션이 임의로 닫지 않는다.

## 흔한 오해

- `AutoCloseable`이라고 항상 파일이나 socket을 소유한다는 뜻은 아니다.
- close 후 객체 reference가 즉시 null이 되는 것은 아니다.
- `close()`가 예외를 던질 수 있으므로 try-with-resources 바깥 계약도 검토해야 한다.
