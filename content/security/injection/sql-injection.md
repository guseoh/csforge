---
kind: concept
contentKey: security.core.injection.sql-injection
topicContentKey: security.core.injection
slug: sql-injection
title: "SQL injection과 값·코드 경계"
summary: "사용자 입력을 SQL 문자열 구조에 결합할 때 데이터가 SQL syntax로 해석되는 injection 원리를 이해하고 parameter binding과 allowlist로 value와 query structure를 분리한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: SQL Injection Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: prepared statements와 allow-list validation 방어 확인
---
# SQL injection과 값·코드 경계

SQL injection은 특수문자 하나가 위험한 것이 아니라 **사용자가 준 데이터가 SQL 문법 일부로 합쳐져 DB parser가 code로 해석하는 순간** 발생합니다.

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

### parameter binding은 data와 SQL structure를 분리한다

```java
jdbcTemplate.query(
    "SELECT * FROM member WHERE email = ?",
    rowMapper,
    email
);
```

DB driver는 query structure와 parameter value를 분리해 처리하므로 입력 문자열 안의 `' OR ...`가 SQL operator로 승격되지 않습니다.

### parameter는 column/table 이름을 대체하지 못한다

```sql
ORDER BY :sortField
```

같이 identifier나 keyword 위치는 value parameter로 안전하게 bind할 수 없는 경우가 많습니다. 사용자에게 sort field를 받는다면 허용된 enum을 server-side mapping합니다.

```java
String orderBy = switch (sort) {
    case CREATED_AT -> "created_at";
    case PRICE -> "price";
};
```

### escaping을 직접 구현하지 않는다

quote를 replace하는 식의 자체 escaping은 encoding, DB dialect, edge case를 놓치기 쉽습니다. Prepared statement/ORM parameter binding을 기본으로 사용합니다.

### 최소 권한도 impact를 줄인다

Injection이 발생해도 application DB role이 superuser라면 피해 범위가 훨씬 커집니다. Parameterization이 1차 방어이고 least privilege는 침해 영향 범위를 줄이는 추가 층입니다.

SQL injection의 본질은 문자열 필터링이 아니라 **untrusted value가 executable query structure가 되는 경계를 없애는 것**입니다.
