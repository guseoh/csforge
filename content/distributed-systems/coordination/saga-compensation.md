---
kind: concept
contentKey: distributed.core.coordination.saga-compensation
topicContentKey: distributed.core.coordination
slug: saga-compensation
title: "Saga와 보상 작업"
summary: "여러 local transaction으로 나뉜 workflow에서 실패 뒤 compensation이 물리적 rollback이 아니라 새로운 business action이라는 점을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://microservices.io/patterns/data/saga.html"
    title: "Microservices.io: Saga Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "local transaction sequence와 compensating transaction 확인"
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Microservices.io: Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "local state update와 event publish의 reliable boundary 확인"
  - url: "https://www.cs.princeton.edu/research/techreps/598"
    title: "Sagas (Garcia-Molina and Salem, 1987)"
    referenceType: OTHER
    language: en
    displayOrder: 3
    relationNote: "long-lived transaction을 local transaction sequence와 compensating transaction으로 나누는 원래 Saga 모델 확인"
---
# Saga와 보상 작업

여러 service가 각각 자신의 database를 소유하면 주문·결제·배송 전체를 하나의 local ACID transaction으로 묶기 어렵습니다. Saga는 긴 workflow를 여러 local transaction으로 나누고, 뒤 단계가 실패했을 때 이미 완료된 앞 단계에 대해 보상 작업(compensation)을 실행하는 방식입니다.

```text
주문 생성
   ↓
재고 예약
   ↓
결제 승인
   ↓
배송 생성 실패
   ↓
결제 취소 → 재고 예약 해제
```

여기서 compensation은 DB rollback처럼 이전 상태를 물리적으로 없애는 기능이 아닙니다. 결제를 이미 승인했다면 환불이라는 새로운 business transaction이 필요하고, 메일을 이미 보냈다면 그 사실 자체를 되돌릴 수 없습니다. 그래서 각 단계는 성공·실패뿐 아니라 `PENDING`, `COMPENSATING`, `FAILED` 같은 업무 상태가 필요할 수 있습니다.

Saga를 연결하는 방법으로 orchestration과 choreography가 자주 비교됩니다. Orchestration은 coordinator가 다음 step과 전체 상태를 명시적으로 관리하고, choreography는 participant들이 event를 발행·구독하며 흐름을 이어갑니다. 어느 쪽이 항상 더 느슨하거나 더 좋은 것은 아니며, workflow가 어디에 보이고 누가 변경 책임을 가지는지가 달라집니다.

Saga는 isolation 문제도 남깁니다. 각 local transaction이 다른 시점에 commit되므로 중간 상태가 다른 요청에 보일 수 있고, 여러 saga가 같은 inventory를 동시에 예약할 수도 있습니다. Reservation, version check, semantic lock처럼 domain invariant를 보호하는 별도 설계가 필요한 이유입니다.

또한 DB 상태 변경과 다음 message publish 사이의 이중 쓰기 문제는 transactional outbox 같은 Messaging 기법으로 줄일 수 있지만, outbox가 saga의 compensation이나 isolation 문제까지 해결하는 것은 아닙니다.

Saga의 핵심은 **분산 workflow를 자동 rollback하는 기술이 아니라, 이미 일어난 business action을 어떻게 보정하고 최종 상태를 회복할지 명시하는 것**입니다.
