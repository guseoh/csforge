---
kind: concept
contentKey: spring.core.data-jpa.fetch-plan
topicContentKey: spring.core.data-jpa
slug: fetch-plan
title: "조회 계획(fetch plan)과 N+1"
summary: "연관관계의 LAZY/EAGER 설정과 실제 쿼리별 조회 계획을 구분하고, 부모 목록 조회 뒤 연관관계 접근이 추가 쿼리를 반복하는 N+1을 실제 쿼리 횟수로 진단한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html"
    title: "Jakarta Persistence 3.2 Specification"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "EAGER/LAZY 로딩 의미와 fetch join 명세 확인"
  - url: "https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html"
    title: "Spring Data JPA Reference: JPA Query Methods"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "@EntityGraph 등 쿼리별 조회 계획 구성 참고"
---
# 조회 계획(fetch plan)과 N+1

주문 20개를 조회한 뒤 각 주문의 회원 이름을 화면에 보여준다고 해 보겠습니다.

```java
List<Order> orders = orderRepository.findAll(pageable).getContent();
for (Order order : orders) {
    System.out.println(order.getMember().getName());
}
```

`member` 연관관계가 LAZY이고 첫 쿼리에서 함께 가져오지 않았다면 각 주문의 `member`에 접근하는 시점에 추가 쿼리가 실행될 수 있습니다.

```text
1) SELECT orders ... limit 20      -> 1 query
2) SELECT member WHERE id=?        -> order 1
3) SELECT member WHERE id=?        -> order 2
...
21) SELECT member WHERE id=?       -> order 20
```

이런 **첫 목록 쿼리 1개 + 각 행·연관관계 접근마다 추가 쿼리 N개** 패턴을 N+1이라고 부릅니다.

### LAZY가 나쁜 것이 아니라 기능에 맞는 조회 계획이 없는 것이 문제다

모든 연관관계를 `EAGER`로 바꾸면 N+1이 자동으로 사라진다고 생각하기 쉽지만 그렇지 않습니다. JPA provider는 EAGER 요구를 만족시키기 위해 join 대신 추가 쿼리를 사용할 수 있고 필요하지 않은 연관관계까지 항상 읽어 비용이 커질 수 있습니다.

```text
연관관계의 fetch type = 기본 로딩 계약
이번 쿼리의 fetch plan = 이 기능에서 무엇을 함께 가져올지
```

대부분의 연관관계를 LAZY로 두고 실제 화면·기능마다 필요한 조회 계획을 명시적으로 선택하는 이유가 여기에 있습니다.

### fetch join은 한 쿼리에서 연관관계를 함께 가져오려는 의도를 표현한다

```jpql
select o
from Order o
join fetch o.member
where o.status = :status
```

`member`처럼 to-one 연관관계는 목록 페이지 조회와 비교적 잘 결합할 수 있습니다. 하지만 collection fetch join은 SQL 결과 행 수가 부모×자식 수만큼 늘어나 페이지네이션과 충돌할 수 있습니다.

```text
Order 1 - Item A
Order 1 - Item B
Order 1 - Item C
Order 2 - Item D
```

DB는 네 행을 보지만 애플리케이션은 Order 두 개를 원합니다. 이런 쿼리에 SQL 수준의 `LIMIT`을 적용하면 “부모 Order 20개”라는 페이지 단위와 맞지 않을 수 있고, JPA provider의 처리 전략에 따라 메모리 페이지네이션이나 추가 작업이 생길 수 있습니다.

### batch fetch는 LAZY를 유지하면서 추가 쿼리를 묶는다

연관관계를 한 개씩 조회하는 대신 여러 식별자를 모아 다음처럼 가져올 수 있습니다.

```sql
SELECT *
FROM member
WHERE id IN (?, ?, ?, ...)
```

쿼리 수를 크게 줄이면서 collection fetch join의 페이지네이션 문제를 피할 수 있지만, **어느 시점에 지연 로딩이 시작되는지**를 코드만 보고 파악하기는 fetch join보다 어려울 수 있습니다.

### N+1은 “발생할 수 있다”가 아니라 실제 쿼리 횟수로 확인한다

Repository 메서드 한 줄만 보고 최적화하지 않습니다.

1. 어떤 API·기능에서 문제가 있는가?
2. 실제 SQL이 몇 번 실행되는가?
3. 부모와 자식 데이터의 개수 관계가 어떤가?
4. 페이지네이션이 있는가?
5. 필요한 응답 데이터 모양은 Entity graph인가 DTO projection인가?

fetch join, entity graph, batch fetch, projection 중 무엇이 맞는지는 이 조건에 따라 달라집니다.

JPA 성능을 학습할 때 가장 중요한 습관은 **Java 객체 탐색을 실제 SQL 실행과 연결해서 보는 것**입니다. getter 한 번이 이미 읽어 둔 메모리 접근인지, 추가 DB 쿼리를 일으키는 접근인지 구분할 수 있어야 합니다.
