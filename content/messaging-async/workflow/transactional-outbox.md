---
kind: concept
contentKey: messaging.core.workflow.transactional-outbox
topicContentKey: messaging.core.workflow
slug: transactional-outbox
title: "트랜잭셔널 아웃박스(Transactional Outbox)와 이중 쓰기 문제"
summary: "업무 DB 커밋과 브로커 발행을 따로 수행할 때 생기는 이중 쓰기 구간을 아웃박스 레코드와 릴레이로 줄이고, 릴레이 중복을 컨슈머 멱등성으로 흡수한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Microservices.io: Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "business update와 outbox 저장, relay duplicate와 idempotent consumer 필요성 확인"
  - url: "https://kafka.apache.org/42/design/design/#message-delivery-semantics"
    title: "Apache Kafka 4.2 Design: Message Delivery Semantics"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "파티션 순서와 at-most-once·at-least-once, Kafka 내부 transaction의 보장 범위를 확인한다."
    displayOrder: 2
    relationNote: "Kafka 내부 소비 위치·출력·거래 경계와 외부 시스템 효과의 차이 확인"
  - url: "https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html"
    title: "Debezium Documentation: Outbox Event Router"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Debezium이 outbox row의 이벤트 ID와 aggregate ID를 메시지 헤더·키로 전달하는 방식을 확인한다."
    displayOrder: 3
    relationNote: "outbox event id·aggregate id를 message id/key로 전달하는 CDC relay 구현 사례 확인"
---
# 트랜잭셔널 아웃박스(Transactional Outbox)와 이중 쓰기 문제

한 요청에서 PostgreSQL을 커밋하고 Kafka에도 이벤트를 발행해야 한다고 해 봅시다. 두 작업을 순서대로 실행하면 어느 쪽이 먼저든 **하나만 성공하는 틈**이 생깁니다.

```text
DB commit 성공
   │
   X 프로세스 종료
   │
Kafka publish 없음
```

반대로 브로커 발행을 먼저 성공시키고 DB 트랜잭션이 롤백되면 존재하지 않는 업무 상태를 하위 시스템이 처리할 수 있습니다.

### 발행 의도를 업무 트랜잭션 안에 함께 기록한다

트랜잭셔널 아웃박스는 브로커 발행 자체를 DB 트랜잭션에 넣는 대신 **나중에 발행해야 한다는 내구성 있는 레코드를 같은 DB에 저장**합니다.

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

DB 커밋이 성공했다면 업무 상태와 아웃박스 레코드가 함께 남고, 릴레이가 일시적으로 실패해도 다시 발행을 시도할 근거가 있습니다. DB와 브로커를 하나의 분산 트랜잭션으로 묶지 않고도 이중 쓰기 구간을 줄이는 이유입니다.

### 릴레이는 같은 이벤트를 다시 보낼 수 있다

릴레이가 브로커 발행에는 성공했지만 아웃박스 처리 완료 상태를 기록하기 전에 종료될 수 있습니다. CDC도 재시작·재생 과정에서 같은 논리 이벤트를 다시 내보낼 수 있습니다.

```text
outbox e42
  ├─ Kafka publish 성공
  X relay 종료
  └─ e42 재시도 → 중복 가능
```

그래서 안정적인 `eventId`와 멱등 컨슈머가 여전히 필요합니다. 아웃박스가 exactly-once 업무 효과를 자동으로 만드는 것은 아닙니다.

### 업무 단위 순서도 별도 계약이다

같은 `orderId`를 Kafka 키로 사용하면 같은 업무 단위의 이벤트를 한 파티션에 모으는 데 도움이 됩니다. 하지만 DB에서 만든 순서, 릴레이가 발행한 순서, 컨슈머가 실제 외부 효과를 완료한 순서는 서로 다른 단계입니다.

순서가 중요한 상태 전이라면 버전이나 순번을 함께 기록하고 릴레이 또는 컨슈머가 역전·누락을 감지할 수 있어야 합니다.

### 아웃박스 자체도 운영 대상이다

릴레이가 멈추면 아웃박스 레코드는 계속 쌓이고 사용자가 보는 후처리 지연도 커집니다. 아웃박스 적체량, 가장 오래된 미발행 레코드의 시간, 릴레이 실패율을 관측하고 성공한 레코드를 언제 정리할지도 정해야 합니다.

트랜잭셔널 아웃박스의 핵심은 Kafka를 더 복잡하게 쓰는 것이 아니라 **업무 커밋과 발행 의도를 하나의 로컬 트랜잭션으로 묶고, 실제 전달은 재시도 가능한 별도 단계로 분리하는 것**입니다.
