---
kind: concept
contentKey: messaging.core.delivery.at-least-once-idempotency
topicContentKey: messaging.core.delivery
slug: at-least-once-idempotency
title: "delivery semantics와 idempotent consumer"
summary: "ack/commit 시점에 따른 at-most-once·at-least-once 차이와 exactly-once 보장 경계를 구분하고 business idempotency를 설계한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html"
    title: "Apache Kafka API: KafkaConsumer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "consumer position·committed position과 record reprocessing 경계 확인"
  - url: "https://kafka.apache.org/documentation/#semantics"
    title: "Apache Kafka Documentation: Message Delivery Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "at-most-once·at-least-once와 Kafka exactly-once semantics의 적용 범위 확인"
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 3
    relationNote: "relay duplicate와 idempotent consumer 필요성 확인"
---
# delivery semantics와 idempotent consumer

Message processing에서 중요한 질문은 “broker가 message를 몇 번 보내나?”보다 **consumer가 언제 처리 완료를 기록하고, 그 전후 crash에서 loss와 duplicate 중 무엇이 생길 수 있는가**입니다. Ack나 offset commit을 business side effect보다 먼저 하느냐 뒤에 하느냐에 따라 failure window가 달라집니다.

### at-most-once와 at-least-once는 실패 위치가 다르다

처리 완료 위치를 먼저 commit하고 business work를 나중에 수행하면, commit 뒤 consumer가 죽었을 때 해당 record가 다시 전달되지 않아 work가 유실될 수 있습니다. 이런 경로는 duplicate를 줄이는 대신 loss 가능성을 받아들이는 at-most-once 성격을 가집니다.

```text
read M42
  ├─ position/ack commit
  ├─ process crash
  └─ business update 미실행 -> redelivery되지 않으면 loss
```

반대로 business side effect를 먼저 commit하고 처리 위치를 나중에 commit하면, 두 commit 사이 crash에서 같은 record가 다시 전달될 수 있습니다. 이것이 흔한 at-least-once duplicate window입니다.

```text
read M42
  ├─ DB INSERT/UPDATE commit
  ├─ process crash
  └─ position 미커밋 -> M42 redelivery 가능
```

따라서 at-most-once와 at-least-once는 “좋고 나쁜 옵션”이라기보다 **loss와 duplicate 중 어느 failure를 어떤 boundary에서 허용하고 복구할지**에 대한 선택입니다.

### idempotency는 duplicate를 business effect 한 번으로 흡수한다

At-least-once를 선택했다면 consumer는 duplicate delivery를 비정상 예외가 아니라 정상 failure model로 취급합니다. `messageId` 또는 domain operation key를 처리 기록에 저장하고 이미 완료된 operation이면 같은 business effect를 다시 만들지 않게 할 수 있습니다.

```text
BEGIN
  INSERT processed_message(message_id)
    ├─ 성공 -> business update 수행
    └─ duplicate conflict -> 이미 처리됨으로 종료
COMMIT
```

처리 기록과 local business update를 같은 DB transaction으로 묶어야 “처리 기록만 성공하고 실제 business update는 실패”하는 상태를 피할 수 있습니다. 외부 결제·메일·다른 API처럼 local DB transaction 밖의 side effect는 provider idempotency key, operation status 조회, compensation·reconciliation 같은 별도 계약이 필요합니다.

### exactly-once라는 말의 경계를 먼저 묻는다

Kafka의 idempotent producer나 transaction처럼 특정 broker/producer-consumer pipeline 안에서 duplicate write를 제어하고 atomic한 처리 범위를 제공하는 기능이 있습니다. 그러나 그 기능의 이름을 보고 **DB, email provider, payment API까지 포함한 전체 business workflow가 물리적으로 딱 한 번 실행된다**고 해석하면 안 됩니다.

예를 들어 Kafka transaction 안에서 input offset과 output topic write를 함께 처리하는 보장을 얻더라도, transaction 밖의 PostgreSQL update나 외부 결제 승인에는 별도 atomicity/idempotency 문제가 남습니다. 따라서 “exactly-once인가?”보다 다음을 묻는 편이 정확합니다.

- 어떤 system boundary 안에서 exactly-once semantics를 제공하는가?
- 어떤 side effect는 그 transaction에 참여하지 않는가?
- duplicate delivery가 생겨도 business invariant가 유지되는가?

### 문제를 풀 때 확인할 것

1. ack/position commit과 business side effect의 순서를 그립니다.
2. crash가 어느 commit 사이에서 일어날 때 loss 또는 duplicate가 생기는지 확인합니다.
3. 중복 판정 key의 lifetime과 uniqueness를 정합니다.
4. processed 기록과 local business update의 transaction 경계를 봅니다.
5. broker의 exactly-once 기능이 실제로 포함하는 resource와 제외하는 외부 side effect를 적습니다.
6. replay와 오래된 message를 다시 처리해도 안전한지 판단합니다.

### 면접에서 설명한다면

At-most-once는 처리 위치를 먼저 확정하면 crash 시 work loss가 생길 수 있고, at-least-once는 business effect 뒤 위치 commit 전에 crash가 나면 duplicate가 생길 수 있습니다. At-least-once consumer는 message id나 business operation key를 durable하게 기록하고 local update와 원자적으로 처리해 duplicate를 흡수합니다. Kafka의 exactly-once 기능도 적용되는 broker/transaction boundary가 있으므로 외부 DB·결제·메일까지 자동으로 한 번만 실행된다고 일반화하지 않습니다.
