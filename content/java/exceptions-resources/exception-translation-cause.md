---
kind: concept
contentKey: java.core.exceptions-resources.exception-translation-cause
topicContentKey: java.core.exceptions-resources
slug: exception-translation-cause
title: "예외 변환과 원인 보존"
summary: "낮은 수준 기술 예외를 상위 계층이 이해할 의미로 바꾸되 cause를 보존해 진단 가능성을 잃지 않는다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html#%3Cinit%3E(java.lang.String,java.lang.Throwable)"
    title: "Java SE 25 API: Throwable cause constructor"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 예외 원인 체인 보존 API 확인
---
# 예외 변환과 원인 보존

하위 계층의 예외 타입이 상위 계층의 관심사와 맞지 않을 수 있습니다. 예를 들어 주문 서비스가 JDBC 드라이버의 세부 예외 타입까지 알아야 한다면 저장 기술을 바꾸기 어렵고 비즈니스 코드의 의미도 흐려집니다.

이럴 때 낮은 수준 예외를 상위 계층의 의미에 맞는 예외로 바꾸는 것을 **예외 변환(exception translation)** 이라고 합니다.

```java
try {
    dao.insert(order);
} catch (SqlConstraintException e) {
    throw new DuplicateOrderException(order.id(), e);
}
```

호출자는 이제 SQL 세부 대신 “중복 주문”이라는 애플리케이션 의미를 처리할 수 있습니다.

### 원래 예외를 버리면 진단 정보가 사라진다

```java
catch (IOException e) {
    throw new ImportException("가져오기 실패");
}
```

메시지만 새로 만들고 원래 예외를 버리면 실제 파일 경로, 원인 stack trace 등 중요한 정보가 사라질 수 있습니다.

```java
catch (IOException e) {
    throw new ImportException("가져오기 실패", e);
}
```

`cause`를 보존하면 상위에서는 추상화된 실패를 다루면서도 운영·디버깅 시 원래 원인까지 따라갈 수 있습니다.

```text
ImportException
   └─ cause: IOException
         └─ cause: 실제 하위 원인 ...
```

### 모든 예외를 custom exception으로 바꿀 필요는 없다

이미 `IllegalArgumentException`처럼 의미가 충분한 표준 예외라면 새 타입을 만드는 것이 오히려 복잡할 수 있습니다. 변환은 **계층 경계를 보호하거나 상위에서 다른 처리가 필요한 의미를 제공할 때** 가치가 있습니다.

또 모든 `RuntimeException`을 하나의 `ServiceException`으로 감싸면 서로 다른 실패 원인이 다시 뭉개질 수 있습니다.

### 메시지와 cause의 역할을 구분한다

상위 예외 메시지에는 현재 계층에서 중요한 문맥을 넣을 수 있습니다.

```java
throw new ImportException("파일 " + path + " 처리 실패", e);
```

다만 비밀번호, access token, 개인정보처럼 로그에 남으면 안 되는 값을 메시지에 포함하지 않도록 주의해야 합니다.

### 실무에서의 기준

- 하위 기술 예외가 상위 API에 그대로 새어 나오는가?
- 상위에서 구분해 처리할 새로운 의미가 있는가?
- 원래 cause와 stack trace를 보존했는가?
- 의미 없는 wrapper 계층만 늘리고 있지는 않은가?

예외 변환의 목적은 예외 이름을 예쁘게 바꾸는 것이 아니라 **추상화 경계를 유지하면서 진단 정보도 잃지 않는 것**입니다.
