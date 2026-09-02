---
kind: concept
contentKey: messaging.core.delivery.retry-dlq
topicContentKey: messaging.core.delivery
slug: retry-dlq
title: "retry와 dead-letter queue"
summary: "transient/permanent failure를 분류하고 retry budget·backoff·DLQ와 재처리 운영을 설계한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "consumer processing과 topic 기반 workflow 확인"
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Microservices.io: Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "message relay와 재처리·duplicate 운영 맥락 확인"
---
# retry와 dead-letter queue

Consumer failure를 무조건 retry하면 poison message 하나가 partition을 계속 막거나 downstream 장애를 증폭시킬 수 있습니다. 먼저 일시적 네트워크 오류인지, schema/validation처럼 같은 입력으로 계속 실패하는 영구 오류인지 분류합니다.

```text
message M
  ├─ transient timeout ─▶ bounded retry + backoff
  └─ invalid schema    ─▶ failed/DLQ workflow + operator action
```

### retry budget을 제한한다

attempt 수, 최대 delay, 전체 deadline을 정하지 않은 retry는 무한 처리와 같은 의미가 됩니다. exponential backoff와 jitter로 여러 consumer가 같은 시각에 retry하는 storm을 줄이고, ordering과 freshness 요구를 깨지 않는 재처리 방식을 선택합니다.

### retry topic과 DLQ는 broker guarantee와 구분한다

Kafka의 consumer delivery semantics 자체가 모든 애플리케이션에 “retry topic”, “delay queue”, “DLQ”라는 동일한 workflow를 자동 제공하는 것은 아닙니다. 별도 topic, consumer pause/seek, framework retry 기능, failed-record store 등으로 구현할 수 있으며 각 방식은 ordering·retention·consumer group state를 다르게 바꿉니다. 따라서 이런 이름을 Kafka protocol 보장처럼 외우지 말고 **실패 record를 언제 정상 흐름에서 분리하고 어디에 durable하게 남길지**를 설계합니다.

### DLQ는 버리는 쓰레기통이 아니다

Dead-letter workflow에는 원본 message id, key, payload version, 실패 원인, attempt 수, 최초·최근 시각을 남겨야 운영자가 원인을 조사하고 안전하게 replay할 수 있습니다. DLQ로 옮겼다고 business failure가 해결된 것은 아니며, 사용자에게 pending/failed 상태를 보여 주거나 수동 보상할 수 있습니다.

### retry와 idempotency는 함께 본다

retry는 같은 operation을 다시 실행하므로 consumer가 idempotent하지 않으면 duplicate side effect를 만듭니다. transient failure가 “처리되지 않았다”는 증거가 아닐 수 있는 remote call에서는 결과 unknown 상태와 idempotency key를 함께 처리합니다.

### 문제를 풀 때 확인할 것

1. failure가 transient인지 permanent인지 분류합니다.
2. retry 횟수·backoff·jitter·deadline을 정합니다.
3. retry 구현이 partition ordering·lag·committed position을 어떻게 바꾸는지 확인합니다.
4. failed/DLQ record와 replay 절차를 durable하게 보존합니다.
5. duplicate side effect와 사용자 상태를 함께 설계합니다.

### 면접에서 설명한다면

Retry는 일시적 실패에 제한적으로 사용하고 validation·schema 오류 같은 permanent failure는 정상 processing path에서 격리합니다. Retry topic이나 DLQ는 Kafka가 모든 경우에 자동 제공하는 delivery guarantee가 아니라 application/framework 패턴일 수 있으므로 ordering·retention·replay 계약을 명시해야 합니다. 재시도 자체가 duplicate side effect를 만들 수 있어 idempotency도 함께 필요합니다.
