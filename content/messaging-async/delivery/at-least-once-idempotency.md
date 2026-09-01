---
kind: concept
contentKey: messaging.core.delivery.at-least-once-idempotency
topicContentKey: messaging.core.delivery
slug: at-least-once-idempotency
title: "at-least-once와 idempotent consumer"
summary: "ack 전 crash가 duplicate delivery를 만드는 이유와 message/business key 기반 중복 처리를 설계한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html"
    title: "Apache Kafka API: KafkaConsumer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "offset commit과 record reprocessing 경계 확인"
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "relay duplicate와 idempotent consumer 필요성 확인"
---
# at-least-once와 idempotent consumer

Consumer가 message를 읽고 DB side effect를 수행한 뒤 offset을 commit한다고 해 보겠습니다. DB commit 직후 process가 죽으면 offset은 이전 위치로 남아 다음 실행에서 같은 message가 다시 전달됩니다.

```text
read M42
  │
  ├─ DB INSERT/UPDATE commit
  ├─ process crash
  └─ offset 미커밋 -> M42 redelivery
```

이런 at-least-once 경로는 message가 한 번만 온다고 가정하는 것보다 현실적인 복구 모델입니다.

### idempotency는 같은 효과를 한 번으로 만든다

consumer는 `messageId` 또는 domain operation key를 처리 기록에 저장하고 이미 완료된 message면 같은 결과를 재적용하지 않게 할 수 있습니다.

```text
INSERT processed_message(message_id)
  ├─ 성공 -> business update 수행
  └─ duplicate conflict -> 이미 처리된 결과로 종료
```

처리 기록과 business update를 같은 DB transaction으로 묶어야 “처리 기록만 저장되고 business update가 실패”하는 상태를 피할 수 있습니다. 외부 API side effect는 provider idempotency key나 결과 조회가 추가로 필요합니다.

### idempotent와 exactly-once를 혼동하지 않는다

consumer가 duplicate를 안전하게 흡수해도 email provider가 두 번 보내는 것을 broker가 자동 취소하지는 않습니다. Kafka producer transaction 등 구현별 exactly-once 기능도 전체 business workflow의 DB·외부 시스템 side effect까지 자동 확장되지 않습니다.

### 문제를 풀 때 확인할 것

1. crash가 어느 commit 사이에서 일어나는지 그립니다.
2. 중복 판정 key의 lifetime과 uniqueness를 정합니다.
3. processed 기록과 local business update의 transaction 경계를 봅니다.
4. 외부 side effect가 있다면 provider idempotency를 확인합니다.
5. replay와 오래된 message가 안전한지 판단합니다.

### 면접에서 설명한다면

At-least-once delivery에서는 side effect 후 offset commit 전에 crash가 나면 같은 message가 다시 옵니다. Consumer는 message id나 business operation key를 durable하게 기록하고 business update와 원자적으로 처리해 duplicate를 흡수해야 합니다. 이것은 전체 분산 workflow가 exactly-once라는 뜻은 아닙니다.

