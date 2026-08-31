---
kind: concept
contentKey: java.core.exceptions-resources.exception-translation-cause
topicContentKey: java.core.exceptions-resources
slug: exception-translation-cause
title: "Exception translation and cause"
summary: "낮은 수준 실패를 의미 있는 예외로 바꾸면서 원인 연결을 보존한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html"
    title: "Java SE 25 API: Throwable"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: cause chain과 예외 관찰 API 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Exception.html"
    title: "Java SE 25 API: Exception"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 애플리케이션 예외의 의미와 생성자 확인
---
# Exception translation and cause

## 쉬운 진입

저장소가 `SQLException`을 던진다고 해서 화면이나 도메인이 데이터베이스 제품의 용어를
알아야 하는 것은 아니다. 낮은 계층의 실패를 현재 경계가 이해하는 예외로 번역하되, 원래
실패를 함께 들고 가면 두 가지 요구를 모두 만족한다.

## 정확한 메커니즘

예외 생성자의 cause 인자 또는 `initCause`로 원인을 연결할 수 있다. 다음 계층은 새 예외의
메시지와 타입으로 의미를 판단하고, `getCause()`와 stack trace로 원래 실패를 조사한다.

```java
try {
    repository.save(record);
} catch (IOException cause) {
    throw new ContentStoreException("콘텐츠 저장에 실패했습니다", cause);
}
```

번역은 추상화 경계를 보호하는 것이지 모든 예외를 무조건 포장하는 규칙이 아니다. 이미
호출자가 처리해야 할 의미가 유지되고, 추가 context가 없으면 전파가 더 정확할 수 있다.

## 실전·면접 연결

예외 타입은 복구 가능성이나 사용자 메시지 같은 호출 계약을 표현하고, cause는 진단 정보의
연결을 표현한다. 새 예외에 원인을 넣지 않은 채 메시지만 복사하면 최초 stack trace와
제품별 오류 정보가 사라진다. 반대로 민감한 내부 정보를 외부 메시지에 그대로 노출하지 않는
것도 boundary의 책임이다.

## 흔한 오해

- `throw new X(cause)`는 cause를 출력 메시지 문자열에 단순히 이어 붙이는 것과 다르다.
- custom exception을 만들었다고 자동으로 원인이 보존되지는 않는다.
- 예외 번역은 실패를 성공 값으로 바꾸는 것이 아니다.
