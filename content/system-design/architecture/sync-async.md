---
kind: concept
contentKey: system-design.core.architecture.sync-async
topicContentKey: system-design.core.architecture
slug: sync-async
title: "동기와 비동기 처리 경계"
summary: "사용자가 응답 시점에 반드시 알아야 하는 결과와 나중에 완료해도 되는 작업을 분리해 latency·failure·state contract에 맞는 처리 방식을 선택한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://microservices.io/patterns/data/saga.html"
    title: "Microservices.io: Saga Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "synchronous request와 asynchronous workflow를 분리하는 설계 맥락 확인"
  - url: "https://grpc.io/docs/guides/deadlines/"
    title: "gRPC Documentation: Deadlines"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "synchronous call의 deadline·cancellation boundary 확인"
---
# 동기와 비동기 처리 경계

모든 작업을 HTTP 응답 안에서 끝내야 하는 것도 아니고, 오래 걸린다고 무조건 queue로 보내야 하는 것도 아닙니다. 먼저 **사용자가 응답을 받을 때 반드시 확정되어 있어야 하는 상태가 무엇인지**를 정하는 것이 중요합니다.

주문 요청에서 기본 검증과 주문 생성이 성공해야 사용자에게 주문 번호를 줄 수 있다면 이 부분은 동기 경계에 둘 수 있습니다. 반면 검색 색인 갱신이나 통계 집계처럼 조금 늦어도 되는 작업은 응답 이후에 처리할 수 있습니다.

```text
request
  │
  ├─ 반드시 즉시 끝나야 함 → synchronous result
  │
  └─ 나중에 완료 가능      → durable accept → asynchronous work
```

비동기 처리로 옮기면 사용자 latency를 줄이고 긴 작업을 분리할 수 있지만 완료 시점의 의미가 달라집니다. `202 Accepted`나 operation ID를 반환했다면 그것은 처리가 끝났다는 뜻이 아니라 **작업을 접수했다는 상태**입니다. 이후 `PENDING → COMPLETED` 또는 `FAILED`처럼 사용자가 최종 결과를 확인할 방법이 필요합니다.

동기 처리도 단순하지는 않습니다. Downstream timeout이 발생했을 때 상대 시스템이 이미 side effect를 수행했을 수 있으므로, 요청 하나에서 기다린다는 사실이 결과의 불확실성을 없애 주지는 않습니다.

따라서 sync/async 선택은 기술 선호가 아니라 세 가지 질문으로 판단할 수 있습니다. 사용자 응답 전에 어떤 상태가 확정되어야 하는가, 작업이 요청 deadline 안에 안정적으로 끝나는가, 실패와 재처리 상태를 어디에서 보관할 것인가입니다.

Messaging의 retry·DLQ·delivery 세부는 별도 영역의 책임입니다. System Design에서는 **사용자에게 보이는 완료 시점과 architecture의 처리 경계를 어디에 둘 것인가**에 집중합니다.
