---
kind: concept
contentKey: security.core.injection.jpql-native
topicContentKey: security.core.injection
slug: jpql-native
title: "JPQL·native query에서도 injection이 생기는 경계"
summary: "ORM을 사용한다고 injection이 사라지는 것이 아니라 JPQL/native SQL 문자열을 동적으로 조립하면 같은 구조 문제가 생기며 parameter binding과 identifier allowlist가 필요함을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: SQL Injection Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: ORM 사용 여부와 무관한 parameterization 원칙 확인
---
# JPQL·native query에서도 injection이 생기는 경계

JPA/Hibernate를 쓴다는 사실만으로 SQL injection이 자동 제거되는 것은 아닙니다. JPQL도 문자열 language이고 사용자 입력을 query structure에 직접 이어 붙이면 injection 가능성이 생깁니다.

```java
String jpql = "select m from Member m where m.email = '" + email + "'";
entityManager.createQuery(jpql, Member.class).getResultList();
```

ORM은 이 문자열을 분석해 SQL로 변환할 뿐 **이미 오염된 query structure를 안전한 parameter로 되돌려 주지 않습니다.**

### JPQL parameter를 사용한다

```java
entityManager.createQuery(
        "select m from Member m where m.email = :email",
        Member.class
    )
    .setParameter("email", email)
    .getResultList();
```

Spring Data derived query나 type-safe query builder를 사용하면 문자열 조립 지점을 줄일 수 있지만 dynamic expression을 직접 만들 때는 같은 원칙이 필요합니다.

### native query는 더 직접적으로 DB syntax와 연결된다

```java
@Query(value = "select * from member where email = :email", nativeQuery = true)
```

parameter binding을 사용하면 value는 안전하게 전달할 수 있습니다. 반대로 table/column/sort direction 같은 structural 부분을 request 값으로 직접 붙이면 위험합니다.

```java
// 위험한 접근
"ORDER BY " + request.getSort()
```

허용 가능한 필드/방향을 enum으로 매핑합니다.

### injection과 authorization은 별개다

Query를 안전하게 parameterize해도 `findById(orderId)`로 다른 사용자의 주문을 반환하면 BOLA가 남습니다. Injection은 code/data 경계 문제이고 authorization은 principal/resource 권한 문제입니다.

ORM을 보안 기능으로 신뢰하기보다 **어떤 API가 value binding을 보장하고 어디에서 query structure를 직접 생성하는지**를 코드 리뷰에서 찾는 것이 중요합니다.
