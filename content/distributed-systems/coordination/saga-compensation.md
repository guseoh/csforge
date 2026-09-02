---
kind: concept
contentKey: distributed.core.coordination.saga-compensation
topicContentKey: distributed.core.coordination
slug: saga-compensation
title: "saga와 compensation"
summary: "local transaction sequence, orchestration/choreography와 business compensation의 한계를 판단한다"
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
---
# saga와 compensation

여러 service가 각자의 database를 소유하면 하나의 ACID transaction으로 전체 workflow를 묶기 어렵습니다. Saga는 각 service의 local transaction과 다음 step을 연결하고, 뒤 단계가 실패하면 이미 완료한 business action을 보정하는 compensating transaction을 실행합니다. 이는 자동 rollback이 아니라 명시적인 business workflow입니다.

### choreography와 orchestration

Choreography는 각 service가 event를 발행해 다음 participant를 깨우고, orchestration은 coordinator가 command와 상태를 관리합니다. 전자는 coupling을 낮출 수 있지만 workflow가 event graph에 흩어지고, 후자는 흐름이 보이지만 orchestrator가 bottleneck·coordination owner가 될 수 있습니다.

```text
reserve ─▶ charge ─▶ ship
   실패 ◀─ compensate charge ◀─ cancel reserve
```

### compensation은 반대 transaction이 아니다

이미 email을 보냈거나 외부 결제를 승인한 작업은 완벽히 되돌릴 수 없습니다. 환불·예약 해제·보류 상태·manual review처럼 새로운 business action을 설계하고, 각 step의 idempotency, timeout, retry, duplicate event와 사용자에게 보일 pending/failed 상태를 정의합니다.

### isolation gap을 인정한다

Saga 중간 상태는 다른 요청에 보일 수 있고 concurrent saga가 같은 inventory를 사용할 수 있습니다. reservation, version check, semantic lock, reconciliation으로 invariant를 보호하며, service DB update와 다음 event intent는 transactional outbox 같은 local boundary로 함께 보존합니다.

### 문제를 풀 때 확인할 것

1. 전체 transaction을 local step과 business invariant로 나눕니다.
2. 각 step의 commit·event·compensation을 정의합니다.
3. choreography와 orchestration의 관측·coupling trade-off를 비교합니다.
4. irreversible external side effect와 pending state를 명시합니다.
5. duplicate·out-of-order·timeout·reconciliation을 설계합니다.

### 면접에서 설명한다면

Saga는 여러 database를 한 transaction으로 잠그는 기술이 아니라 local transaction sequence와 명시적 compensation입니다. Choreography와 orchestration 중 workflow visibility와 coupling을 기준으로 선택하고, 자동 rollback이 없으며 isolation gap·irreversible side effect·duplicate event를 reservation·outbox·reconciliation으로 관리합니다.
