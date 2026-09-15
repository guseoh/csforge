---
kind: concept
contentKey: messaging.core.delivery.ordering
topicContentKey: messaging.core.delivery
slug: ordering
title: "메시지 순서와 병렬 처리"
summary: "partition 안의 record 순서와 실제 consumer 작업 완료 순서를 구분하고, business key별 순서를 지키면서 처리량을 확보하는 방법을 판단한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "partition이 ordering과 parallelism의 단위인 이유 확인"
---
# 메시지 순서와 병렬 처리

주문 하나에 `Placed → Paid → Shipped` 순서가 필요하더라도 topic 전체의 모든 message를 직렬화할 필요는 없습니다. 먼저 **어떤 업무 단위 안에서만 순서가 필요한지**를 찾습니다.

```text
order-7: Placed → Paid → Shipped
order-8: Placed → Cancelled
```

`orderId`처럼 같은 aggregate를 한 partition에 모으면 그 partition에 append된 record의 순서를 이용할 수 있습니다. 다른 주문끼리는 서로 다른 partition에서 병렬로 처리할 수 있습니다.

### Partition 순서와 완료 순서는 다르다

Consumer가 partition에서 `Placed`, `Paid`를 순서대로 읽어도 각각을 별도 worker에 넘기면 실제 완료 순서는 뒤집힐 수 있습니다.

```text
poll order
1. Placed → Worker A ───── 느림
2. Paid   → Worker B ─ 빠르게 완료

DB apply order
Paid → Placed  // 역전 가능
```

따라서 순서가 중요한 key는 consumer 내부에서도 처리 순서를 보존해야 합니다. Partition 단위로 직렬 처리하거나, key별 queue를 두거나, event version/sequence를 확인해 예상하지 않은 역순 적용을 거부할 수 있습니다.

### 강한 순서는 처리량 비용을 가진다

모든 message를 한 partition에 넣으면 순서를 설명하기는 쉽지만 동시에 처리할 수 있는 범위가 크게 줄어듭니다. 반대로 partition과 worker를 많이 늘리면 처리량은 높아질 수 있지만 순서 경계와 hot partition을 더 신중하게 관리해야 합니다.

```text
강한 전역 순서
→ 단순한 ordering
→ 낮은 parallelism

key별 순서
→ aggregate 내부 ordering
→ aggregate 사이 parallelism 가능
```

업무에서 필요한 것은 대부분 “모든 event의 전역 순서”가 아니라 특정 aggregate의 상태 전이가 역전되지 않는 것입니다.

메시지 ordering을 설계할 때는 broker의 partition 순서만 확인하지 말고 **producer routing, consumer 내부 병렬 처리, 실제 side effect 완료 순서까지 하나의 timeline으로 연결**해야 합니다.
