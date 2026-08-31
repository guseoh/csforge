---
kind: concept
contentKey: spring.core.data-jpa.repository-abstraction
topicContentKey: spring.core.data-jpa
slug: repository-abstraction
title: "Spring Data Repository 추상화"
summary: "Repository interface로 반복 persistence adapter 코드를 줄이되 method 이름과 query 의미, aggregate boundary, 성능 특성까지 framework가 자동으로 올바르게 설계해 주는 것은 아님을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-data/jpa/reference/repositories/core-concepts.html"
    title: "Spring Data JPA Reference: Core concepts"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Repository/CrudRepository 계열의 core abstraction 확인"
  - url: "https://docs.spring.io/spring-data/jpa/reference/repositories/query-methods-details.html"
    title: "Spring Data JPA Reference: Query Methods"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "method-name query derivation과 declared query 동작 확인"
---
# Spring Data Repository 추상화

JPA만 사용해도 `EntityManager`로 entity를 저장하고 조회할 수 있습니다. 하지만 애플리케이션마다 `find`, `save`, paging, query parameter binding 같은 반복 adapter code를 직접 작성하면 persistence boilerplate가 커집니다. Spring Data는 repository interface를 선언하면 **공통 CRUD와 query method 구현을 runtime에 제공**해 이 반복을 줄입니다.

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
}
```

application service는 `EntityManager` 생성·query object boilerplate보다 use-case에 가까운 repository method를 호출할 수 있습니다.

### interface가 생겼다고 DB 접근 의미가 사라지는 것은 아니다

```java
List<Order> findByMemberIdAndStatusOrderByCreatedAtDesc(
        Long memberId,
        OrderStatus status
);
```

method 이름에서 query를 유도할 수 있지만 결국 DB query가 실행됩니다. 반환 collection의 크기, ordering, index, N+1, transaction scope는 여전히 고려해야 합니다.

```text
Repository method
      │ Spring Data proxy/implementation
      ▼
JPA query / EntityManager
      ▼
Hibernate/provider
      ▼
JDBC
      ▼
Database
```

Spring Data repository는 이 stack을 없애는 것이 아니라 **상위 application code에서 반복 API를 추상화**합니다.

### `save()`를 모든 domain 동작의 중심으로 생각하지 않는다

managed entity는 transaction/persistence context 안에서 상태가 바뀌면 dirty checking으로 UPDATE될 수 있습니다.

```java
@Transactional
public void complete(long id) {
    Order order = repository.findById(id).orElseThrow();
    order.complete();
    // managed 상태라면 반드시 save(order)를 다시 호출해야만 UPDATE되는 구조는 아니다.
}
```

`save()` semantics는 entity가 새 것인지 기존 것인지 판단해 `persist`/`merge` 경로와 연결될 수 있으므로 “JPA에서는 모든 변경 뒤 save를 호출한다”는 습관은 persistence context를 가릴 수 있습니다.

### Repository method는 use-case와 aggregate 경계를 드러낼 수 있다

```java
Optional<Order> findByOrderNumber(OrderNumber number);
```

좋은 repository interface는 “DB table을 그대로 CRUD한다”보다 application/domain이 필요한 aggregate 조회/저장 의도를 표현할 수 있습니다. 반대로 다음처럼 모든 field 조합마다 finder를 늘리면 repository가 거대한 query catalog가 될 수 있습니다.

```text
findByAAndBAndC...
findByAAndBAndD...
findByAAndCAndD...
```

복잡한 검색은 Specification/Querydsl/custom repository/query object 같은 다른 표현을 검토할 수 있습니다.

### 추상화가 query cost를 숨길 때가 가장 위험하다

```java
orderRepository.findAll();
```

한 줄이므로 싸 보이지만 100만 row를 가져올 수 있습니다. repository abstraction을 사용할수록 method contract에 page bound, ordering, fetch plan을 더 분명히 해야 합니다.

Spring Data를 잘 사용하는 기준은 repository code 양을 줄였다는 것보다 **persistence 기술 boilerplate는 숨기되 데이터 접근의 의미와 비용은 숨기지 않는 것**입니다.
