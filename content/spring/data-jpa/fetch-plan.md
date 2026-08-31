---
kind: concept
contentKey: spring.core.data-jpa.fetch-plan
topicContentKey: spring.core.data-jpa
slug: fetch-plan
title: "fetch plan과 N+1"
summary: "연관관계 LAZY/EAGER 설정과 실제 query별 fetch plan을 구분하고, parent 목록 뒤 association 접근이 반복 secondary query를 만드는 N+1을 query count로 진단한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html"
    title: "Jakarta Persistence 3.2 Specification"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "EAGER/LAZY fetch semantics와 fetch join specification 확인"
  - url: "https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html"
    title: "Spring Data JPA Reference: JPA Query Methods"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "@EntityGraph 등 query-specific fetch 구성 참고"
---
# fetch plan과 N+1

주문 20개를 조회한 뒤 각 주문의 회원 이름을 화면에 보여주려 한다고 해 보겠습니다.

```java
List<Order> orders = orderRepository.findAll(pageable).getContent();
for (Order order : orders) {
    System.out.println(order.getMember().getName());
}
```

`member` association이 lazy이고 처음 query에서 함께 가져오지 않았다면 각 order의 member를 접근하는 시점에 추가 query가 실행될 수 있습니다.

```text
1) SELECT orders ... limit 20      -> 1 query
2) SELECT member WHERE id=?        -> order 1
3) SELECT member WHERE id=?        -> order 2
...
21) SELECT member WHERE id=?       -> order 20
```

이런 **첫 목록 query 1개 + 각 row/association마다 추가 query N개** 패턴을 N+1이라고 부릅니다.

### LAZY가 나쁜 것이 아니라 실제 use case의 fetch plan이 없는 것이 문제다

모든 association을 `EAGER`로 바꾸면 N+1이 자동으로 사라진다고 생각하기 쉽지만 그렇지 않습니다. provider는 eager requirement를 만족시키기 위해 join 대신 secondary query를 사용할 수 있고, 필요 없는 graph까지 항상 로딩해 비용이 커질 수 있습니다.

```text
mapping fetch type = 기본/계약 수준의 로딩 기대
query fetch plan    = 이번 use case에서 무엇을 한 번에 가져올지
```

대부분의 association을 lazy로 두고 실제 화면/use case마다 필요한 fetch plan을 명시적으로 선택하는 이유가 여기에 있습니다.

### fetch join은 한 query에서 association을 가져오게 의도를 표현한다

```jpql
select o
from Order o
join fetch o.member
where o.status = :status
```

member가 to-one이라면 list pagination과도 비교적 잘 결합할 수 있습니다. 하지만 collection fetch join은 SQL row 수가 parent×child로 늘어나고 pagination과 충돌할 수 있습니다.

```text
Order 1 - Item A
Order 1 - Item B
Order 1 - Item C
Order 2 - Item D
```

DB는 네 row를 보지만 application은 Order 두 개를 원합니다. 여기서 SQL-level `LIMIT`을 걸면 parent 기준 page가 깨질 수 있어 provider가 memory pagination warning/extra work를 할 수 있습니다.

### batch fetch는 LAZY를 유지하면서 secondary query를 묶는다

association을 한 개씩 조회하는 대신 여러 identifier를 모아:

```sql
SELECT *
FROM member
WHERE id IN (?, ?, ?, ...)
```

처럼 가져올 수 있습니다. query 수를 크게 줄이면서 collection pagination 문제를 피할 수 있지만, **언제 lazy initialization이 발생하는지**를 코드만 보고 추론하기가 fetch join보다 어려울 수 있습니다.

### N+1은 “발생할 수 있다”가 아니라 실제 query count로 확인한다

repository method 한 줄만 보고 최적화하지 않습니다.

1. 어떤 API/use case에서 문제가 있는가?
2. 실제 SQL이 몇 번 실행되는가?
3. parent/child cardinality가 얼마인가?
4. pagination이 있는가?
5. 필요한 data shape는 entity graph인가 DTO projection인가?

fetch join, entity graph, batch fetch, projection 중 무엇이 맞는지는 이 조건에 따라 달라집니다.

JPA 성능을 학습할 때 가장 중요한 습관은 **Java object traversal을 SQL execution과 연결해서 보는 것**입니다. getter 한 번이 이미 로딩된 memory access인지 DB query trigger인지 구분할 수 있어야 합니다.
