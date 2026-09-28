---
kind: concept
contentKey: distributed.core.coordination.saga-compensation
topicContentKey: distributed.core.coordination
slug: saga-compensation
title: "Saga와 보상 작업"
summary: "여러 로컬 트랜잭션으로 나뉜 업무 흐름에서 보상 작업은 물리적 롤백이 아니라 새로운 업무 동작이라는 점을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://microservices.io/patterns/data/saga.html"
    title: "Microservices.io: Saga Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "로컬 트랜잭션의 연속과 보상 트랜잭션으로 구성되는 Saga 모델 확인"
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Microservices.io: Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "로컬 상태 변경과 이벤트 발행 사이의 신뢰성 경계 확인"
  - url: "https://www.cs.princeton.edu/research/techreps/598"
    title: "Sagas (Garcia-Molina and Salem, 1987)"
    referenceType: OTHER
    language: en
    displayOrder: 3
    relationNote: "긴 트랜잭션을 로컬 트랜잭션과 보상 트랜잭션의 연속으로 나누는 원래 Saga 모델 확인"
  - url: "https://techblog.woowahan.com/26832/"
    title: "한꺼번에 짊어지던 배치를 내려놓고, 하나씩 흘려보내는 워크플로로"
    referenceType: OTHER
    language: ko
    displayOrder: 4
    relationNote: "여러 서비스 단계의 실패를 보상 작업으로 되돌리고 재실행을 멱등하게 다루는 실제 워크플로 사례 확인"
---
# Saga와 보상 작업

여러 서비스가 각각 자신의 데이터베이스를 소유하면 주문·결제·배송 전체를 하나의 로컬 ACID 트랜잭션으로 묶기 어렵습니다. Saga는 긴 업무 흐름을 여러 로컬 트랜잭션으로 나누고, 뒤 단계가 실패했을 때 이미 완료된 앞 단계에 대해 보상 작업(compensation)을 실행하는 방식입니다.

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

여기서 보상 작업은 DB 롤백처럼 이전 상태를 물리적으로 없애는 기능이 아닙니다. 결제를 이미 승인했다면 환불이라는 새로운 업무 트랜잭션이 필요하고, 메일을 이미 보냈다면 그 사실 자체를 되돌릴 수 없습니다. 그래서 각 단계는 성공·실패뿐 아니라 `PENDING`, `COMPENSATING`, `FAILED`처럼 진행 중인 업무 상태가 필요할 수 있습니다.

Saga를 연결하는 방법으로 오케스트레이션(orchestration)과 코레오그래피(choreography)가 자주 비교됩니다. 오케스트레이션은 중앙 조정자가 다음 단계와 전체 상태를 명시적으로 관리하고, 코레오그래피는 참여 서비스들이 이벤트를 발행·구독하며 흐름을 이어갑니다. 어느 쪽이 항상 더 느슨하거나 더 좋은 것은 아니며, 전체 흐름이 어디에 드러나고 누가 변경 책임을 가지는지가 달라집니다.

Saga는 격리(isolation) 문제도 남깁니다. 각 로컬 트랜잭션이 서로 다른 시점에 커밋되므로 중간 상태가 다른 요청에 보일 수 있고, 여러 Saga가 같은 재고를 동시에 예약할 수도 있습니다. 예약(reservation), 버전 검사, 의미적 잠금처럼 도메인 불변 조건을 보호하는 별도 설계가 필요한 이유입니다.

또한 DB 상태 변경과 다음 메시지 발행 사이의 이중 쓰기 문제는 트랜잭셔널 아웃박스(transactional outbox) 같은 Messaging 기법으로 줄일 수 있지만, 아웃박스가 Saga의 보상 작업이나 격리 문제까지 해결하는 것은 아닙니다.

Saga의 핵심은 **분산 업무 흐름을 자동으로 롤백하는 기술이 아니라, 이미 일어난 업무 동작을 어떻게 보정하고 최종 상태를 회복할지 명시하는 것**입니다.
