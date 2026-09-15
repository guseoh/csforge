---
kind: concept
contentKey: messaging.core.delivery.at-least-once-idempotency
topicContentKey: messaging.core.delivery
slug: at-least-once-idempotency
title: "전달 보장과 멱등 Consumer"
summary: "처리 결과와 committed offset의 순서에 따라 loss 또는 duplicate가 생기는 이유를 이해하고, at-least-once 환경에서 중복 업무 효과를 막는 멱등 처리를 설계한다."
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
# 전달 보장과 멱등 Consumer

Consumer가 message를 읽고 DB를 변경할 때 **업무 처리 완료와 offset commit은 별개의 상태**입니다. 어느 쪽을 먼저 확정하느냐에 따라 장애 시 loss 또는 duplicate가 생길 수 있습니다.

### 처리 위치를 먼저 commit하면 작업을 잃을 수 있다

```text
M42 읽음
  │
  ├─ offset commit
  │
  X crash
  │
  └─ business update 미실행
```

재시작 시 committed position이 M42 뒤를 가리키면 해당 message를 다시 읽지 않을 수 있습니다. 이런 선택은 중복을 줄이는 대신 일부 작업이 유실될 수 있는 at-most-once 성격을 가집니다.

### 업무 처리를 먼저 끝내면 message가 다시 올 수 있다

```text
M42 읽음
  │
  ├─ business DB update commit
  │
  X crash
  │
  └─ offset commit 미완료
```

재시작하면 M42가 다시 전달될 수 있습니다. At-least-once 환경에서는 이런 duplicate를 예외 상황이 아니라 정상적인 실패 모델로 봐야 합니다.

### 중복 delivery를 한 번의 업무 효과로 흡수한다

`messageId`나 domain operation key를 처리 기록으로 남기면 같은 message가 다시 와도 동일한 business effect를 반복하지 않게 만들 수 있습니다.

```text
BEGIN
  processed_message에 messageId INSERT
    ├─ 새 id → business update 수행
    └─ 이미 존재 → 중복 처리로 종료
COMMIT
```

처리 기록과 local business update를 같은 DB transaction에 넣어야 “처리했다고 기록했지만 실제 상태는 안 바뀐” 틈을 줄일 수 있습니다.

외부 결제나 이메일처럼 local DB transaction 밖의 side effect는 별도 문제입니다. Consumer가 중복 message를 받지 않는다고 가정하기보다 provider idempotency key나 결과 조회·reconciliation 같은 계약이 필요할 수 있습니다.

### Exactly-once라는 표현은 보장 경계를 확인한다

Kafka transaction을 사용하면 Kafka input을 처리해 Kafka output을 쓰는 pipeline에서 output records와 consumed offsets를 같은 Kafka transaction으로 묶는 구성이 가능합니다. 하지만 그 transaction에 PostgreSQL, 결제 API, 이메일 시스템이 자동으로 참여하는 것은 아닙니다.

```text
Kafka input
   │
   ▼
Kafka transaction
  ├─ output records
  └─ consumed offsets

외부 DB/API side effect
→ 별도 transaction / idempotency 경계
```

따라서 exactly-once는 “전체 시스템에서 모든 업무 효과가 물리적으로 한 번만 실행된다”는 문장이 아니라 **어느 resource와 transaction 경계 안에서 중복을 제거하는지**를 구체적으로 설명해야 합니다.
