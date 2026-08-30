---
kind: concept
contentKey: java.core.exceptions-resources.propagation-translation
topicContentKey: java.core.exceptions-resources
slug: propagation-translation
title: 예외 전파와 경계에서의 변환
summary: 저수준 실패를 적절한 애플리케이션 의미로 바꾸고 원인을 보존한다
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html"
    title: "Java Language Specification 11장: Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 예외 발생·전파 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html"
    title: Throwable API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: cause와 예외 연결 확인
---
# 예외 전파와 변환

예외는 현재 메서드가 처리하지 않으면 호출 스택을 따라 전파됩니다. 모든 곳에서 잡아 로그만 남기고 다시 던지면 호출자는 실패를 알 수 없고, 반대로 모든 예외를 `Exception` 하나로 뭉개면 복구 가능성과 원인이 사라집니다.

저장소나 HTTP client처럼 기술 세부를 아는 경계에서 `SQLException` 같은 저수준 예외를 도메인·애플리케이션 의미의 예외로 변환하면 상위 계층이 특정 라이브러리에 묶이지 않습니다. 변환할 때는 원인(cause)을 연결해 진단 정보를 보존합니다.

```java
try {
    return gateway.load(id);
} catch (RemoteTimeoutException exception) {
    throw new ProfileUnavailableException("profile service timeout", exception);
}
```

예외를 정상적인 분기처럼 사용하지 말고, 복구·응답 변환·트랜잭션 경계처럼 책임이 있는 계층에서만 잡습니다. HTTP 상태 코드를 정하는 일은 controller/advice의 책임이며, domain은 HTTP를 알 필요가 없습니다.
