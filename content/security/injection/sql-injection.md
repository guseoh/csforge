---
kind: concept
contentKey: security.core.injection.sql-injection
topicContentKey: security.core.injection
slug: sql-injection
title: "SQL 인젝션과 값·쿼리 구조의 경계"
summary: "사용자 입력을 SQL 문장에 직접 붙이면 데이터가 쿼리 문법으로 해석되는 원리와, 매개변수 바인딩·허용 목록으로 이를 막는 방법을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: SQL Injection Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "준비된 문장과 허용 목록 검증을 통한 방어 확인"
---
# SQL 인젝션과 값·쿼리 구조의 경계

SQL 인젝션은 **사용자가 준 데이터가 SQL 문장의 일부가 되어 DB가 쿼리 문법으로 해석할 때** 발생합니다.

```java
String sql = "SELECT * FROM member WHERE email = '" + email + "'";
```

공격 입력이:

```text
' OR '1'='1
```

이라면 최종 SQL 구조 자체가 바뀔 수 있습니다.

```sql
SELECT * FROM member
WHERE email = '' OR '1'='1';
```

### 매개변수 바인딩은 데이터와 SQL 구조를 분리한다

```java
TypedQuery<Member> query = entityManager.createQuery(
    "select m from Member m where m.email = :email",
    Member.class
);
query.setParameter("email", email);
```

JPA나 JPQL에서도 쿼리 구조와 값을 분리하면 입력에 포함된 `' OR ...`가 연산자로 해석되지 않습니다. **신뢰할 수 없는 값을 문자열에 이어 붙이지 않고 매개변수로 전달하는 것**이 핵심입니다.

### 매개변수로 열·테이블 이름을 지정할 수는 없다

```sql
ORDER BY :sortField
```

열 이름이나 SQL 키워드가 들어갈 위치에는 일반적인 값 매개변수를 사용할 수 없습니다. 정렬 필드를 요청으로 받는다면 허용된 이름만 서버의 열거형이나 매핑에서 선택합니다.

```java
String orderBy = switch (sort) {
    case CREATED_AT -> "created_at";
    case PRICE -> "price";
};
```

### 문자 이스케이프를 직접 구현하지 않는다

따옴표를 직접 치환하는 방식은 인코딩과 DB 문법의 예외를 놓치기 쉽습니다. 준비된 문장이나 ORM의 매개변수 바인딩을 사용합니다.

### 최소 권한도 피해 범위를 줄인다

인젝션이 발생했을 때 애플리케이션 DB 계정에 관리자 권한까지 있다면 피해 범위가 커집니다. 매개변수 바인딩으로 인젝션을 막고 DB 계정의 최소 권한으로 피해를 제한합니다.

SQL 인젝션 방어의 핵심은 **신뢰할 수 없는 값이 실행되는 쿼리의 구조로 들어가지 않게 하는 것**입니다.
