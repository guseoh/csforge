---
kind: concept
contentKey: backend.core.concurrency-transaction.usecase-transaction
topicContentKey: backend.core.concurrency-transaction
slug: usecase-transaction
title: use-case transaction
summary: 사용자 관점에서 함께 성공하거나 실패해야 하는 local DB 변경의 경계를 transaction으로 묶고 외부 side effect는 별도로 다룬다.
level: 3
status: PUBLISHED
displayOrder: 30
references: []
---
# use-case transaction

Transaction 경계를 repository method마다 두는 것과 use-case 단위로 두는 것은 결과가 다릅니다. 중요한 질문은 **사용자 관점에서 어떤 변경들이 함께 성공하거나 함께 실패해야 하는가**입니다.

### 주문 생성 예시

```text
createOrder()
 ├─ orderRepository.save(order)
 ├─ inventory.reserve(items)
 └─ coupon.markUsed()
```

세 변경이 하나의 PostgreSQL 안에 있고 “주문 생성”이 하나의 atomic use-case라면 Application Service transaction으로 묶는 것이 자연스럽습니다.

### transaction 안에 외부 HTTP 호출을 오래 두면

```text
DB transaction BEGIN
  ├─ row update / lock
  ├─ remote payment call ───── 3 seconds
  ├─ more DB work
COMMIT
```

remote latency 동안 DB connection과 lock을 오래 잡을 수 있습니다. 외부 호출이 timeout됐지만 provider에서 실제 처리가 끝났는지도 불명확할 수 있습니다.

### local transaction과 distributed transaction을 구분한다

DB transaction은 같은 resource manager 안의 atomicity를 강하게 제공하지만 HTTP API, email, Kafka까지 자동 rollback하지 않습니다. 외부 side effect가 섞이면 outbox, idempotency, compensation, reconciliation 같은 패턴이 필요할 수 있습니다.

### transaction을 너무 크게 잡는 비용

긴 batch 전체를 하나의 transaction으로 묶으면 rollback 범위는 단순하지만 lock, version 보존, memory, 재처리 비용이 커집니다. chunk 단위 commit이 더 안전할 수 있습니다.

### 코드 위치

Spring에서는 Application Service에 `@Transactional`을 두는 경우가 많지만 annotation 위치 자체가 원칙은 아닙니다. **use-case atomicity가 어디까지인지 먼저 정하고 framework transaction을 그 경계에 맞추는 것**이 핵심입니다.
