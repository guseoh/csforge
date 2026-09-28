---
kind: concept
contentKey: spring.core.data-jpa.repository-abstraction
topicContentKey: spring.core.data-jpa
slug: repository-abstraction
title: "Spring Data Repository 추상화"
summary: "Repository 인터페이스로 반복적인 영속성 어댑터 코드를 줄이되 메서드 이름과 쿼리 의미, Aggregate 경계, 성능 특성까지 Spring Data가 자동으로 올바르게 설계해 주는 것은 아님을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-data/jpa/reference/repositories/core-concepts.html"
    title: "Spring Data JPA Reference: Core concepts"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Repository/CrudRepository 계열의 핵심 추상화 확인"
  - url: "https://docs.spring.io/spring-data/jpa/reference/repositories/query-methods-details.html"
    title: "Spring Data JPA Reference: Query Methods"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "메서드 이름 기반 쿼리 생성과 선언적 쿼리 동작 확인"
---
# Spring Data Repository 추상화

JPA만 사용해도 `EntityManager`로 Entity를 저장하고 조회할 수 있습니다. 하지만 애플리케이션마다 `find`, `save`, 페이지 조회, 쿼리 매개변수 바인딩 같은 반복 코드를 직접 작성하면 영속성 어댑터 코드가 커집니다. Spring Data는 Repository 인터페이스를 선언하면 **공통 CRUD와 쿼리 메서드 구현을 실행 시점에 제공**해 이런 반복을 줄입니다.

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
}
```

애플리케이션 서비스는 `EntityManager`와 쿼리 객체를 직접 다루는 반복 코드보다 기능 의도에 가까운 Repository 메서드를 호출할 수 있습니다.

### 인터페이스가 생겼다고 DB 접근 의미가 사라지는 것은 아니다

```java
List<Order> findByMemberIdAndStatusOrderByCreatedAtDesc(
        Long memberId,
        OrderStatus status
);
```

메서드 이름에서 쿼리를 유도할 수 있지만 결국 DB 쿼리가 실행됩니다. 반환 결과의 크기, 정렬, 인덱스, N+1, 트랜잭션 범위는 여전히 고려해야 합니다.

```text
Repository 메서드
      │ Spring Data proxy/구현체
      ▼
JPA query / EntityManager
      ▼
Hibernate 등 JPA provider
      ▼
JDBC
      ▼
Database
```

Spring Data Repository는 이 실행 계층을 없애는 것이 아니라 **상위 애플리케이션 코드에서 반복적인 영속성 API 사용을 추상화**합니다.

### `save()`를 모든 도메인 변경의 중심으로 생각하지 않는다

managed Entity는 트랜잭션과 영속성 컨텍스트 안에서 상태가 바뀌면 변경 감지(dirty checking)로 UPDATE될 수 있습니다.

```java
@Transactional
public void complete(long id) {
    Order order = repository.findById(id).orElseThrow();
    order.complete();
    // managed 상태라면 반드시 save(order)를 다시 호출해야만 UPDATE되는 구조는 아니다.
}
```

`save()`는 Entity가 새 객체인지 기존 객체인지 판단해 `persist` 또는 `merge` 경로와 연결될 수 있으므로 “JPA에서는 모든 변경 뒤 `save()`를 호출한다”는 습관은 영속성 컨텍스트의 동작을 가릴 수 있습니다.

### Repository 메서드는 기능 의도와 Aggregate 경계를 드러낼 수 있다

```java
Optional<Order> findByOrderNumber(OrderNumber number);
```

좋은 Repository 인터페이스는 DB 테이블을 그대로 CRUD하는 것보다 애플리케이션·도메인이 필요한 Aggregate 조회와 저장 의도를 표현할 수 있습니다. 반대로 모든 필드 조합마다 조회 메서드를 늘리면 Repository가 거대한 쿼리 목록이 될 수 있습니다.

```text
findByAAndBAndC...
findByAAndBAndD...
findByAAndCAndD...
```

복잡한 검색은 Specification, Querydsl, custom Repository, 별도 쿼리 객체 같은 표현을 검토할 수 있습니다.

### 추상화가 쿼리 비용을 숨길 때가 가장 위험하다

```java
orderRepository.findAll();
```

코드 한 줄이라 싸 보이지만 데이터가 100만 행이라면 큰 비용이 생길 수 있습니다. Repository 추상화를 사용할수록 메서드 계약에 조회 범위, 안정적인 정렬, 조회 계획(fetch plan)을 더 분명히 해야 합니다.

Spring Data를 잘 사용하는 기준은 Repository 코드 양을 줄였다는 것보다 **영속성 기술의 반복 코드는 숨기되 데이터 접근의 의미와 비용은 숨기지 않는 것**입니다.
