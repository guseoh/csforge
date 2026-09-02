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
  - url: "https://kafka.apache.org/42/design/design/#message-delivery-semantics"
    title: "Apache Kafka 4.2 Design: Message Delivery Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "at-most-once·at-least-once와 Kafka exactly-once processing의 적용 범위 확인"
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Microservices.io: Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 3
    relationNote: "relay duplicate와 idempotent consumer 필요성 확인"
---
# delivery semantics와 idempotent consumer

Message processing에서 중요한 질문은 “broker가 message를 몇 번 보내나?”보다 **consumer가 언제 처리 완료 위치를 기록하고, 그 전후 crash에서 loss와 duplicate 중 무엇이 생길 수 있는가**입니다. Kafka consumer group에서는 committed offset이 restart/rebalance의 복구 기준이고, business side effect와 이 commit은 자동으로 하나의 transaction이 아닙니다.

### at-most-once와 at-least-once는 실패 위치가 다르다

처리 위치를 먼저 commit하고 business work를 나중에 수행하면, commit 뒤 consumer가 죽었을 때 해당 record가 다시 전달되지 않아 work가 유실될 수 있습니다. Kafka 공식 문서도 consumer가 processing 전에 offset을 commit하는 방식을 at-most-once 구현 예로 설명합니다.

```text
read M42
  ├─ committed position 먼저 이동
  ├─ process crash
  └─ business update 미실행 -> restart가 M42 뒤에서 시작하면 loss
```

반대로 business side effect를 먼저 commit하고 처리 위치를 나중에 commit하면, 두 commit 사이 crash에서 같은 record가 다시 전달될 수 있습니다. 이것이 흔한 at-least-once duplicate window입니다.

```text
read M42
  ├─ DB INSERT/UPDATE commit
  ├─ process crash
  └─ committed position 갱신 전 -> M42 redelivery 가능
```

따라서 at-most-once와 at-least-once는 “좋고 나쁜 옵션”이라기보다 **loss와 duplicate 중 어느 failure를 어떤 boundary에서 허용하고 복구할지**에 대한 선택입니다.

### idempotency는 duplicate를 business effect 한 번으로 흡수한다

At-least-once를 선택했다면 consumer는 duplicate delivery를 정상 failure model로 취급합니다. `messageId` 또는 domain operation key를 처리 기록에 저장하고 이미 완료된 operation이면 같은 business effect를 다시 만들지 않게 할 수 있습니다.

```text
BEGIN
  INSERT processed_message(message_id)
    ├─ 성공 -> business update 수행
    └─ duplicate conflict -> 이미 처리됨으로 종료
COMMIT
```

처리 기록과 local business update를 같은 DB transaction으로 묶어야 “처리 기록만 성공하고 실제 business update는 실패”하는 상태를 피할 수 있습니다. 외부 결제·메일·다른 API처럼 local DB transaction 밖의 side effect는 provider idempotency key, operation status 조회, compensation·reconciliation 같은 별도 계약이 필요합니다.

### Kafka exactly-once는 consume-process-produce 경계를 구체적으로 본다

Kafka의 idempotent producer는 producer retry 때문에 같은 record가 broker log에 중복 append되는 문제를 줄이는 기능입니다. 이것과 Kafka transaction을 이용한 consume-process-produce exactly-once는 같은 범위가 아닙니다.

Kafka topic에서 record를 읽어 다른 Kafka topic으로 결과를 쓰는 pipeline에서 exactly-once processing을 구성하려면 transactional producer가 **output records와 consumer group offsets를 같은 transaction에 포함**시키고, aborted transaction의 record를 결과로 보지 않도록 consumer isolation도 함께 구성해야 합니다. Kafka 4.2 문서는 `sendOffsetsToTransaction`으로 offsets가 transaction commit과 함께 확정되고, `read_committed` consumer가 aborted transaction record를 노출하지 않는 흐름을 설명합니다.

```text
Kafka input
  -> process
  -> Kafka transaction
       ├─ output topic records
       └─ consumed offsets
  -> commit
```

이 atomic boundary에 PostgreSQL update, email provider, payment API 같은 외부 resource가 자동으로 들어오는 것은 아닙니다. 따라서 “Kafka exactly-once를 켰다”와 “전체 business workflow의 모든 side effect가 물리적으로 한 번 실행된다”를 같은 뜻으로 사용하면 안 됩니다.

### 문제를 풀 때 확인할 것

1. committed consumer position과 business side effect의 순서를 그립니다.
2. crash가 어느 commit 사이에서 일어날 때 loss 또는 duplicate가 생기는지 확인합니다.
3. 중복 판정 key의 lifetime과 uniqueness를 정합니다.
4. processed 기록과 local business update의 transaction 경계를 봅니다.
5. Kafka transaction을 쓴다면 output records와 consumed offsets가 실제 같은 transaction인지 확인합니다.
6. broker transaction 밖의 DB·결제·메일 side effect에는 별도 idempotency/reconciliation을 둡니다.

### 면접에서 설명한다면

At-most-once는 처리 위치를 먼저 확정하면 crash 시 work loss가 생길 수 있고, at-least-once는 business effect 뒤 위치 commit 전에 crash가 나면 duplicate가 생길 수 있습니다. Kafka의 exactly-once processing은 Kafka 내부 consume-process-produce에서 transaction에 output records와 offsets를 함께 넣는 구체적 boundary를 가집니다. 외부 DB·결제·메일은 그 transaction의 participant가 아니므로 별도의 idempotency와 reconciliation이 필요합니다.
