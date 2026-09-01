---
kind: concept
contentKey: messaging.core.semantics.partition-key
topicContentKey: messaging.core.semantics
slug: partition-key
title: "topic·partition·message key"
summary: "partition이 parallelism과 ordering의 단위가 되는 이유와 key 선택이 traffic·sequence를 바꾸는 흐름을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation: Design"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "topic partition, producer key와 log ordering 개념 확인"
---
# topic·partition·message key

Kafka-style log에서 Topic은 message stream의 논리 이름이고 Partition은 append-only log와 parallelism의 단위입니다. 한 partition 안에는 append된 record의 offset 순서가 있지만 topic 전체에 하나의 전역 순서가 자동으로 생기는 것은 아닙니다.

```text
Topic: order-events
  Partition 0: o-1 -> o-3 -> o-5
  Partition 1: o-2 -> o-4
```

### key는 routing과 ordering 범위를 함께 바꾼다

Kafka producer의 partitioning strategy가 key를 기준으로 deterministic하게 partition을 선택하는 구성이라면 **같은 serialized key는 같은 partition으로 보내는 방식**을 사용할 수 있습니다. 주문 상태처럼 하나의 aggregate에 대해 `Placed -> Paid -> Shipped` 순서가 필요하다면 `orderId`를 key로 두어 같은 aggregate event가 하나의 partition log에 모이게 하는 선택이 자연스럽습니다.

하지만 “key가 같으면 어떤 Kafka 구성에서도 영원히 같은 partition이고 application event 순서가 자동 보장된다”고 일반화하면 안 됩니다. custom partitioner를 사용하거나 partition 수를 변경하면 key-to-partition mapping이 달라질 수 있고, producer retry/idempotence·concurrency 설정도 producer가 관찰하는 ordering에 영향을 줄 수 있습니다. **기본 보장은 partition log 안에 append된 record의 순서**이고, application은 producer와 partitioning 계약까지 함께 확인해야 합니다.

반대로 key가 없거나 ordering을 고려하지 않은 routing을 사용하면 한 주문의 event가 서로 다른 partition으로 나뉠 수 있어 consumer가 aggregate-level 순서를 가정하기 어려워집니다.

### partition 수가 concurrency 상한에 영향을 준다

consumer group 안에서 하나의 partition은 한 시점에 한 consumer group member에 할당되어 처리됩니다. partition 수보다 consumer가 많으면 일부 consumer는 할 일이 없고, partition 수를 늘리면 parallelism은 늘 수 있지만 ordering 범위·rebalance·storage 관리 비용과 key remapping 영향을 함께 봐야 합니다.

```text
3 partitions + 5 consumers
  ├─ C1 -> P0
  ├─ C2 -> P1
  ├─ C3 -> P2
  └─ C4/C5 -> 대기
```

### hot partition과 business key skew

모든 message가 같은 tenant나 aggregate key에 몰리면 key routing이 특정 partition을 hot하게 만들 수 있습니다. 단순히 partition 수를 늘려도 같은 key를 하나의 partition에 유지하는 동안 해당 key의 traffic이 여러 partition으로 자동 분산되지는 않습니다. key 설계, aggregate ordering 요구, hot key 완화 비용을 함께 봅니다.

### 문제를 풀 때 확인할 것

1. ordering이 필요한 business 단위를 찾습니다.
2. producer partitioning strategy가 key를 어떻게 partition에 mapping하는지 확인합니다.
3. partition 수 변경과 producer retry/idempotence 설정이 ordering expectation에 미치는 영향을 봅니다.
4. partition 수와 consumer 수의 parallelism을 계산합니다.
5. key skew로 hot partition이 생기는지, topic 전체 순서를 가정하고 있지 않은지 확인합니다.

### 면접에서 설명한다면

Partition은 log ordering과 consumer parallelism의 단위이고, message key는 producer의 partitioning strategy에 따라 partition routing에 사용됩니다. 같은 aggregate key를 같은 partition에 모으면 그 partition의 log order를 활용할 수 있지만 topic 전체 순서나 key의 영구적인 partition 고정까지 자동 보장되는 것은 아닙니다. partition count·producer 설정·key distribution과 business ordering을 함께 설계해야 합니다.

