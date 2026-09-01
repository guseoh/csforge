---
kind: concept
contentKey: messaging.core.delivery.ordering
topicContentKey: messaging.core.delivery
slug: ordering
title: "message ordering과 concurrency"
summary: "partition-local ordering과 consumer concurrency의 trade-off를 aggregate sequence에 적용한다"
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation: Design"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "partition이 ordering과 parallelism의 단위인 이유 확인"
---
# message ordering과 concurrency

주문에 `Placed`, `Paid`, `Cancelled` event가 있을 때 consumer가 `Paid`를 먼저 적용하면 잘못된 상태가 될 수 있습니다. ordering은 “모든 message가 전역적으로 순서대로 처리된다”가 아니라 **어떤 key 범위에서 어떤 순서를 요구하는가**의 계약입니다.

```text
order-7: Placed -> Paid -> Shipped   // 필요한 순서
order-8: Placed -> Cancelled
```

### partition은 ordering 범위다

같은 aggregate key를 같은 partition으로 보내면 해당 partition의 log 순서를 활용할 수 있습니다. 하지만 여러 partition의 event 사이에는 전역 순서가 없고, consumer가 병렬로 처리하면 완료 시점도 달라질 수 있습니다.

### concurrency가 ordering을 깨는 지점

한 partition에서 record를 순서대로 poll해도 consumer가 각 record를 별도 worker에 동시에 넘기면 `Paid` 작업이 `Placed`보다 먼저 DB에 반영될 수 있습니다. 순서가 중요한 key는 partition 단위 serial processing, per-key queue, version check 중 하나를 선택해야 합니다.

```text
poll: Placed, Paid
  ├─ worker A: Placed (느림)
  └─ worker B: Paid   (빠름) -> 완료 순서 역전
```

### ordering과 throughput은 trade-off다

모든 message를 하나의 partition으로 보내면 순서는 단순하지만 처리량과 장애 격리가 약해집니다. partition을 늘리면 throughput은 좋아질 수 있으나 key routing, hot partition, cross-key coordination 비용이 생깁니다. business invariant에 정말 순서가 필요한 범위만 좁혀야 합니다.

### 문제를 풀 때 확인할 것

1. 순서가 필요한 aggregate와 event를 찾습니다.
2. key가 그 aggregate를 같은 partition으로 보내는지 봅니다.
3. consumer 내부 parallelism이 partition 순서를 무너뜨리는지 확인합니다.
4. version/sequence check로 역순 적용을 거부할지 정합니다.
5. ordering 비용과 throughput·lag를 비교합니다.

### 면접에서 설명한다면

Message ordering은 전체 topic의 전역 순서가 아니라 business key와 partition 범위의 계약입니다. 같은 key를 같은 partition으로 보내도 consumer 내부에서 병렬 처리하면 완료 순서가 역전될 수 있으므로, 필요한 key만 직렬화하거나 version check를 사용하고 throughput·hot partition 비용을 함께 판단합니다.

