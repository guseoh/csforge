---
kind: concept
contentKey: messaging.core.semantics.consumer-offset
topicContentKey: messaging.core.semantics
slug: consumer-offset
title: "consumer group과 offset"
summary: "consumer group의 work sharing, offset commit과 replay·rebalance의 관계를 판단한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html"
    title: "Apache Kafka API: KafkaConsumer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "consumer position, offset commit과 group consumption 확인"
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "consumer group과 partition assignment 기본 개념 확인"
---
# consumer group과 offset

Consumer group은 같은 logical application의 consumer들이 partition work를 나누는 단위입니다. 서로 다른 group은 같은 message를 각자의 목적에 따라 읽을 수 있고, 같은 group 안에서는 한 partition의 처리를 한 consumer가 맡는 구조로 scale-out합니다.

```text
Topic P0,P1,P2
  ├─ group: search-indexer  -> index consumer들
  └─ group: analytics       -> analytics consumer들
```

### offset은 처리 위치이지 business commit과 같지 않다

consumer가 record를 poll한 위치와 그 record의 side effect가 DB에 commit된 시점은 다릅니다. offset을 먼저 commit하고 DB write가 실패하면 message를 건너뛸 수 있고, DB write 후 offset commit 전에 crash하면 같은 message가 다시 올 수 있습니다.

```text
read offset 10
  ├─ offset commit 먼저 -> DB 실패 -> loss 가능
  └─ DB commit 먼저 -> process crash -> redelivery 가능
```

그래서 at-least-once consumer는 duplicate를 정상 경로로 보고 idempotency를 설계하는 경우가 많습니다.

### rebalance는 ownership 변화다

consumer가 죽거나 group member가 늘고 줄면 partition assignment가 바뀔 수 있습니다. 처리 중인 record의 lease와 offset commit 시점을 잘못 다루면 재처리·lag·긴 pause가 생깁니다. rebalance가 일어날 때 어떤 partition을 누가 소유하는지와 in-flight 작업을 어떻게 끝낼지 확인합니다.

### replay는 복구 도구이면서 비용이다

offset을 과거로 되돌리면 bug fix 후 재처리하거나 projection을 rebuild할 수 있지만, side effect가 idempotent하지 않으면 duplicate email·중복 적립이 발생할 수 있습니다. retention, schema compatibility, 처리 속도와 downstream 부하를 함께 계산해야 합니다.

### 문제를 풀 때 확인할 것

1. 같은 group인지 다른 group인지 확인합니다.
2. side effect commit과 offset commit 순서를 그립니다.
3. crash·rebalance 시 record가 재전달될 수 있는지 봅니다.
4. replay가 안전한지 business key와 retention을 확인합니다.
5. lag와 in-flight 처리 시간을 함께 관측합니다.

### 면접에서 설명한다면

Consumer group은 partition work를 나누는 실행 단위이고 offset은 consumer의 log position입니다. offset commit은 DB side effect와 자동으로 하나의 transaction이 아니므로 commit 순서에 따라 loss 또는 duplicate가 생길 수 있습니다. replay와 rebalance까지 고려해 idempotent processing과 lag 관측을 둡니다.

