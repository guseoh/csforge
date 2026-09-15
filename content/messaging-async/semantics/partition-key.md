---
kind: concept
contentKey: messaging.core.semantics.partition-key
topicContentKey: messaging.core.semantics
slug: partition-key
title: "토픽·파티션·메시지 키"
summary: "partition이 순서와 병렬 처리의 기본 단위가 되는 이유를 이해하고 message key가 같은 업무 단위를 한 partition으로 모으는 조건과 편향 위험을 판단한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "topic partition, producer key와 log ordering 개념 확인"
---
# 토픽·파티션·메시지 키

Kafka topic은 하나의 거대한 순차 파일이 아니라 여러 partition으로 나뉠 수 있습니다. 각 partition은 append되는 record의 순서를 가지며, consumer group은 여러 partition을 나눠 읽어 병렬 처리합니다.

```text
order-events
  ├─ Partition 0: e1 → e4 → e7
  ├─ Partition 1: e2 → e5
  └─ Partition 2: e3 → e6
```

Kafka가 보장하는 순서는 **topic 전체가 아니라 각 partition 안의 record 순서**입니다.

### Key는 관련 message를 같은 partition으로 모으는 재료다

한 주문의 상태 변화가 순서대로 처리되어야 한다면 `orderId` 같은 business key를 partitioning에 사용할 수 있습니다.

```text
key=order-42
Placed → Paid → Shipped
       │
       └─ 같은 partition으로 routing
```

같은 key가 같은 partition으로 가는 producer configuration을 사용하면 aggregate별 순서를 partition log에 보존하기 쉬워집니다. 다만 custom partitioner나 partition 수 변경처럼 routing 규칙이 바뀌면 key와 partition의 대응도 달라질 수 있으므로 “같은 key는 영원히 같은 물리 partition”이라는 식으로 일반화하면 안 됩니다.

### Partition 수는 병렬 처리 폭과 연결된다

일반 consumer group에서는 한 partition이 한 시점에 한 group member에게 할당됩니다.

```text
3 partitions
P0 → Consumer A
P1 → Consumer B
P2 → Consumer C
Consumer D → 할당받을 partition 없음
```

Partition을 늘리면 동시에 처리할 수 있는 범위를 키울 수 있지만, 순서가 필요한 단위도 더 세분화됩니다. Consumer 수만 늘린다고 partition 수를 넘어 무한히 처리량이 증가하지도 않습니다.

### Key 편향은 hot partition을 만든다

특정 tenant나 aggregate에 traffic이 몰리면 그 key가 배치된 partition만 바빠질 수 있습니다. 이 경우 전체 broker 사용량은 여유가 있어도 한 partition의 lag가 빠르게 증가합니다.

따라서 key를 고를 때는 **어떤 업무 단위의 순서를 묶을 것인지**와 **traffic이 얼마나 균등하게 퍼지는지**를 함께 봐야 합니다. Ordering을 위해 모든 message를 하나의 key로 묶으면 순서는 단순해지지만 parallelism을 거의 잃게 됩니다.
