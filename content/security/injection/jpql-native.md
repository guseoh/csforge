---
kind: concept
contentKey: security.core.injection.jpql-native
topicContentKey: security.core.injection
slug: jpql-native
title: "JPQL·네이티브 쿼리에서도 인젝션이 생기는 경계"
summary: "JPA를 사용해도 사용자 입력을 JPQL·네이티브 쿼리의 구조에 직접 붙이면 인젝션 위험이 남는 이유와 값 바인딩·허용 목록의 역할을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: SQL Injection Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "ORM 사용 여부와 관계없는 매개변수 바인딩 원칙 확인"
---
# JPQL·네이티브 쿼리에서도 인젝션이 생기는 경계

JPA나 Hibernate를 사용해도 SQL 인젝션이 자동으로 사라지는 것은 아닙니다. JPQL 문자열의 구조에 사용자 입력을 직접 붙이면 인젝션 위험이 남습니다.

```java
String jpql = "select m from Member m where m.email = '" + email + "'";
entityManager.createQuery(jpql, Member.class).getResultList();
```

ORM은 이 문자열을 분석해 SQL로 변환할 뿐 **이미 오염된 쿼리 구조를 안전한 매개변수로 되돌려 주지 않습니다.**

### JPQL 매개변수를 사용한다

```java
entityManager.createQuery(
        "select m from Member m where m.email = :email",
        Member.class
    )
    .setParameter("email", email)
    .getResultList();
```

Spring Data의 메서드 이름 기반 쿼리나 타입 안전 쿼리 생성기를 사용하면 문자열 조립을 줄일 수 있습니다. 동적 식을 직접 만들 때도 입력값과 쿼리 구조는 구분해야 합니다.

### 네이티브 쿼리는 DB 문법과 직접 연결된다

```java
@Query(value = "select * from member where email = :email", nativeQuery = true)
```

값은 매개변수로 전달할 수 있습니다. 테이블·열 이름이나 정렬 방향처럼 쿼리의 구조가 되는 부분에는 요청 문자열을 직접 붙이지 않아야 합니다.

```java
// 위험한 접근
"ORDER BY " + request.getSort()
```

허용할 필드와 정렬 방향을 서버의 열거형으로 매핑합니다.

### 인젝션과 인가는 별개다

쿼리 값을 안전하게 바인딩해도 `findById(orderId)`로 다른 사용자의 주문을 반환하면 BOLA가 남습니다. 인젝션 방어는 쿼리의 문법과 값을 분리하고, 인가는 현재 사용자에게 해당 주문의 접근 권한이 있는지 판단합니다.

ORM을 쓴다는 사실만 믿지 말고 **값을 매개변수로 전달하는 지점과 쿼리 구조를 직접 만드는 지점**을 구분해야 합니다.
