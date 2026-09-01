---
kind: concept
contentKey: messaging.core.semantics.consumer-offset
topicContentKey: messaging.core.semantics
slug: consumer-offset
title: "consumer group과 offset"
summary: "consumer group의 work sharing, record offset·consumer position·committed position과 replay·rebalance의 관계를 판단한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html"
    title: "Apache Kafka API: KafkaConsumer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "consumer position과 committed position, group consumption 계약 확인"
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "consumer group과 partition assignment 기본 개념 확인"
  - url: "https://engineering.linecorp.com/ko/blog/applying-kafka-streams-for-internal-message-delivery-pipeline"
    title: "LINE Engineering: 내부 데이터 파이프라인에 Kafka Streams 적용하기"
    referenceType: BLOG
    language: ko
    displayOrder: 3
    relationNote: "Kafka consumer가 topic의 처리 위치를 offset으로 관리하고 여러 consumer가 stream을 처리하는 실제 적용 맥락 확인"
---
# consumer group과 offset

Consumer group은 같은 logical application의 consumer들이 partition work를 나누는 단위입니다. 서로 다른 group은 같은 message stream을 각자의 목적에 따라 읽을 수 있고, 같은 group 안에서는 partition assignment를 나눠 처리량을 scale-out합니다.

```text
Topic P0,P1,P2
  ├─ group: search-indexer  -> index consumer들
  └─ group: analytics       -> analytics consumer들
```

### record offset과 consumer 위치를 구분한다

Kafka partition의 각 record에는 log 안의 위치를 나타내는 **offset**이 있습니다. Consumer API 관점에서는 다시 현재 **position**과 **committed position**을 구분해야 합니다.

- record offset: partition log에서 특정 record가 가진 위치
- consumer position: 다음 fetch에서 읽을 record의 offset
- committed position: restart·rebalance 뒤 복구를 시작할 위치로 외부에 저장한 값

Consumer가 `poll()`로 record를 받아 현재 position이 앞으로 이동해도 committed position이 자동으로 같은 시점에 갱신되는 것은 아닙니다. 따라서 “offset이 10이다”라는 표현만으로는 record의 위치인지, 현재 consumer가 다음에 읽을 위치인지, restart 기준으로 저장된 위치인지 알 수 없습니다.

### 처리 위치와 business commit은 같은 transaction이 아니다

consumer position/commit과 그 record가 만든 DB side effect의 commit 시점은 별개의 상태입니다. 처리 위치를 먼저 commit하고 DB write가 실패하면 해당 work를 다시 읽지 못해 loss가 생길 수 있고, DB write 후 committed position을 갱신하기 전에 crash하면 같은 record가 다시 전달될 수 있습니다.

```text
record offset 10 처리
  ├─ committed position 먼저 이동 -> DB 실패 -> loss 가능
  └─ DB commit 먼저 -> process crash -> old committed position에서 redelivery 가능
```

그래서 at-least-once consumer는 duplicate를 정상 failure path로 보고 idempotency를 설계하는 경우가 많습니다.

### rebalance는 ownership 변화다

consumer가 죽거나 group member가 늘고 줄면 partition assignment가 바뀔 수 있습니다. 처리 중인 record와 committed position을 잘못 다루면 재처리·lag·긴 pause가 생깁니다. rebalance가 일어날 때 어떤 partition을 누가 소유하는지와 in-flight 작업을 어떻게 끝낼지 확인합니다.

### replay는 복구 도구이면서 비용이다

committed position을 과거로 옮기거나 별도 consumer가 과거 offset부터 읽으면 bug fix 후 재처리하거나 projection을 rebuild할 수 있습니다. 하지만 side effect가 idempotent하지 않으면 duplicate email·중복 적립이 발생할 수 있으므로 retention, schema compatibility, 처리 속도와 downstream 부하를 함께 계산해야 합니다.

### 문제를 풀 때 확인할 것

1. 같은 group인지 다른 group인지 확인합니다.
2. record offset, current position, committed position을 구분합니다.
3. business side effect commit과 committed position 갱신 순서를 그립니다.
4. crash·rebalance 시 record가 재전달되거나 유실될 수 있는지 봅니다.
5. replay가 안전한지 business key·retention·schema와 downstream capacity를 확인합니다.

### 면접에서 설명한다면

Consumer group은 partition work를 나누는 실행 단위입니다. Record offset은 log의 record 위치이고, consumer position은 다음에 읽을 위치, committed position은 restart/rebalance의 복구 기준입니다. 이 처리 위치 상태와 DB side effect는 자동으로 하나의 transaction이 아니므로 순서에 따라 loss 또는 duplicate가 생길 수 있습니다. replay와 rebalance까지 고려해 idempotent processing과 lag를 운영합니다.
