---
kind: concept
contentKey: messaging.core.workflow.transactional-outbox
topicContentKey: messaging.core.workflow
slug: transactional-outbox
title: "transactional outbox"
summary: "DB commit과 message publish 사이 dual-write gap을 outbox·relay·idempotent consumer로 해결한다"
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
# transactional outbox

주문 row를 DB에 commit한 뒤 Kafka publish를 수행하면 그 사이 process가 죽어 event가 사라질 수 있습니다. 반대로 message를 먼저 publish하고 DB transaction이 rollback되면 존재하지 않는 주문을 downstream이 처리할 수 있습니다.

```text
위험한 dual write
  DB commit ── crash ── Kafka publish 없음

transactional outbox
  DB transaction
    ├─ order row
    └─ outbox row
          │ commit
          ▼
       relay/CDC ─▶ broker
```

### outbox는 atomicity 경계를 DB에 둔다

business state와 publish intent를 같은 DB transaction에 저장하면 DB commit이 없을 때 outbox도 남지 않고, commit이 있으면 relay가 나중에 message를 보낼 근거가 남습니다. DB와 broker를 하나의 distributed transaction으로 묶는 대신 durable outbox를 중간 기록으로 사용합니다. Relay는 polling publisher일 수도 있고 CDC 기반일 수도 있으며, 이 구현 선택은 publish latency·ordering·operational ownership을 바꿉니다.

### relay도 duplicate할 수 있다

Polling relay가 broker publish 성공 후 outbox sent 표시 전에 죽거나, CDC pipeline이 restart/replay하면서 같은 logical event를 다시 전달하는 경우처럼 relay boundary에서도 duplicate 가능성을 고려해야 합니다. 따라서 outbox는 exactly-once business effect를 자동 보장하지 않으며 stable event id와 idempotent consumer가 필요합니다.

### aggregate key는 ordering의 재료이지 전체 보장이 아니다

Debezium Outbox Event Router 같은 구현은 aggregate id를 emitted Kafka record의 key로 사용해 같은 aggregate를 같은 partition에 routing할 수 있습니다. 그러나 **outbox row가 생성된 business sequence, relay가 broker에 append하는 순서, consumer가 실제 side effect를 완료하는 순서**는 서로 다른 경계입니다.

```text
DB sequence:       e41 -> e42
relay append:      e41 -> e42   // 이 순서를 relay가 실제 보존하는지 확인
consumer complete: e42 -> e41   // 내부 parallelism이면 역전 가능
```

같은 aggregate의 순서가 invariant라면 outbox에 aggregate sequence/version을 기록하고 relay가 그 순서를 보존하거나 consumer가 sequence gap·역순 적용을 검증하도록 설계합니다. `orderId`를 key로 넣는 것만으로 이미 뒤집힌 publish order를 복구할 수는 없습니다.

### outbox 운영 비용

outbox가 계속 쌓이면 DB storage와 relay lag가 증가합니다. publisher가 어느 시점까지 처리했는지, 실패 attempt·next retry·dead state를 기록하고 보존 기간과 cleanup을 정해야 합니다. CDC를 쓰더라도 connector lag, schema evolution, replay와 broker availability를 관측해야 합니다.

### 문제를 풀 때 확인할 것

1. DB commit과 broker publish 사이 crash window를 그립니다.
2. business row와 outbox row가 같은 local transaction인지 봅니다.
3. polling/CDC relay의 duplicate·restart semantics를 확인합니다.
4. event id, aggregate key와 aggregate sequence의 역할을 구분합니다.
5. relay publish order와 consumer completion order가 business invariant를 만족하는지 검증합니다.
6. outbox backlog·retry·cleanup·relay lag를 운영 metric으로 둡니다.

### 면접에서 설명한다면

Transactional outbox는 business row와 publish intent를 같은 DB transaction에 저장해 DB-broker dual-write gap을 줄이는 패턴입니다. Relay는 이후 broker로 전달하므로 duplicate 가능성이 남고, aggregate key는 partition routing에 도움을 줄 뿐 publish/apply 순서 전체를 자동 보장하지 않습니다. Stable event id, idempotent consumer, sequence 검증과 relay backlog 운영까지 함께 필요합니다.
