---
kind: concept
contentKey: backend.core.domain.entity
topicContentKey: backend.core.domain
slug: entity
title: Entity와 identity
summary: Entity를 “DB 테이블과 매핑되는 클래스”로 이해하면 JPA Entity와 Domain Entity를 같은 것으로 오해하기 쉽습니다. Domain 관점에서 Entity의 핵심은 속성이 조금 바뀌어도 같은 대상을 계속 추적할 수 있는 identity와 lifecycle입니다.
level: 1
status: PUBLISHED
displayOrder: 10
references: []
---
# Entity와 identity

Entity를 “DB 테이블과 매핑되는 클래스”로 이해하면 JPA Entity와 Domain Entity를 같은 것으로 오해하기 쉽습니다. Domain 관점에서 Entity의 핵심은 **속성이 조금 바뀌어도 같은 대상을 계속 추적할 수 있는 identity와 lifecycle**입니다.

### 이름이 바뀌어도 같은 주문인가

```text
Order #1024
 ├─ status: CREATED  →  PAID  →  SHIPPED
 ├─ address: A       →  B
 └─ total: 30,000
```

상태와 주소가 바뀌어도 `#1024` 주문은 같은 주문입니다. 반면 `Money(10000, KRW)` 같은 값은 어느 행에서 왔는지보다 값 자체가 중요하므로 Value Object에 가깝습니다.

### identity는 DB PK와 같을 수도, 다를 수도 있다

실무에서는 DB primary key가 Entity identity로 자주 쓰이지만 개념적으로 동일한 것은 아닙니다. 외부에 노출하는 주문 번호와 내부 surrogate PK를 분리할 수도 있습니다.

```text
DB PK          : 981237 (내부 관계/저장 최적화)
orderNumber    : ORD-2026-000184 (business/external identity)
```

어떤 identity가 lifecycle 동안 안정적으로 유지되어야 하는지 먼저 정해야 합니다.

### equals를 무조건 ID로 만들면 되는가

JPA 환경에서는 persist 전 ID가 아직 없거나 proxy가 개입할 수 있어 equality 설계가 까다롭습니다. 그래서 “Entity는 무조건 ID equals/hashCode” 같은 한 줄 규칙보다 collection 사용, ID 생성 시점, persistence framework 동작을 함께 판단해야 합니다.

### Entity가 가져야 하는 것

Entity는 mutable해도 된다는 뜻이 아닙니다. 중요한 것은 **허용된 상태 전이만 제공하는 것**입니다.

```java
order.pay(paymentId);
order.ship(trackingNumber);
order.cancel(reason);
```

`setStatus(PAID)`처럼 모든 상태를 외부가 만들 수 있게 열면 lifecycle 규칙이 깨집니다.

### 흔한 혼동

- JPA `@Entity`가 붙었다고 풍부한 Domain Entity가 되는 것은 아닙니다.
- 모든 DB row를 Domain Entity로 모델링할 필요도 없습니다.
- identity가 필요 없는 값까지 Entity로 만들면 변경 추적과 저장 책임만 커집니다.
