---
kind: concept
contentKey: messaging.core.workflow.transactional-outbox
topicContentKey: messaging.core.workflow
slug: transactional-outbox
title: "Transactional Outbox와 이중 쓰기 문제"
summary: "business DB commit과 broker publish를 따로 수행할 때 생기는 dual-write gap을 outbox row와 relay로 줄이고, relay duplicate를 consumer idempotency로 흡수한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Microservices.io: Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "business update와 outbox 저장, relay duplicate와 consumer idempotency 확인"
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "broker publish와 consumer delivery 경계 확인"
  - url: "https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html"
    title: "Debezium Documentation: Outbox Event Router"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "outbox event id·aggregate id를 message id/key로 전달하는 CDC relay 구현 사례 확인"
---
# Transactional Outbox와 이중 쓰기 문제

한 요청에서 PostgreSQL을 commit하고 Kafka에도 event를 publish해야 한다고 해 봅시다. 두 작업을 순서대로 실행하면 어느 쪽이 먼저든 **하나만 성공하는 틈**이 생깁니다.

```text
DB commit 성공
   │
   X process crash
   │
Kafka publish 없음
```

반대로 broker publish를 먼저 성공시키고 DB transaction이 rollback되면 존재하지 않는 business state를 downstream이 처리할 수 있습니다.

### Publish 의도를 business transaction 안에 함께 기록한다

Transactional Outbox는 broker publish 자체를 DB transaction에 넣는 대신 **나중에 publish해야 한다는 durable record를 같은 DB에 저장**합니다.

```text
BEGIN
  orders INSERT/UPDATE
  outbox INSERT
COMMIT
       │
       ▼
relay / CDC
       │
       ▼
Kafka publish
```

DB commit이 성공했다면 business state와 outbox record가 함께 남고, relay가 일시적으로 실패해도 다시 publish를 시도할 근거가 있습니다. DB와 broker를 하나의 distributed transaction으로 묶지 않고도 dual-write gap을 줄이는 이유입니다.

### Relay는 같은 event를 다시 보낼 수 있다

Relay가 broker publish에는 성공했지만 outbox 처리 완료 상태를 기록하기 전에 죽을 수 있습니다. CDC도 restart/replay 과정에서 같은 logical event를 다시 내보낼 수 있습니다.

```text
outbox e42
  ├─ Kafka publish 성공
  X relay crash
  └─ e42 재시도 → duplicate 가능
```

그래서 stable `eventId`와 idempotent consumer가 여전히 필요합니다. Outbox가 exactly-once business effect를 자동으로 만드는 것은 아닙니다.

### Aggregate 순서도 별도 계약이다

같은 `orderId`를 Kafka key로 사용하면 같은 aggregate의 event를 한 partition에 모으는 데 도움이 됩니다. 하지만 DB에서 만든 순서, relay가 publish한 순서, consumer가 실제 side effect를 완료한 순서는 서로 다른 단계입니다.

순서가 중요한 상태 전이라면 aggregate version이나 sequence를 함께 기록하고 relay 또는 consumer가 역전·누락을 감지할 수 있어야 합니다.

### Outbox 자체도 운영 대상이다

Relay가 멈추면 outbox row는 계속 쌓이고 사용자가 보는 후처리 지연도 커집니다. Outbox backlog, oldest unpublished age, relay 실패율을 관측하고 성공한 row를 언제 정리할지도 정해야 합니다.

Transactional Outbox의 핵심은 Kafka를 더 복잡하게 쓰는 것이 아니라 **business commit과 publish 의도를 하나의 local transaction으로 묶고, 실제 전달은 재시도 가능한 별도 단계로 분리하는 것**입니다.
