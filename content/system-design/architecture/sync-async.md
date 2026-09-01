---
kind: concept
contentKey: system-design.core.architecture.sync-async
topicContentKey: system-design.core.architecture
slug: sync-async
title: "synchronous와 asynchronous boundary"
summary: "user response와 background workflow를 latency·failure·delivery·state contract에 따라 나눈다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://microservices.io/patterns/data/saga.html"
    title: "Microservices.io: Saga Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "synchronous request가 asynchronous saga outcome을 확인하는 방식 확인"
  - url: "https://grpc.io/docs/guides/deadlines/"
    title: "gRPC Documentation: Deadlines"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "synchronous call의 deadline·cancellation boundary 확인"
---
# synchronous와 asynchronous boundary

Synchronous flow는 caller가 response를 기다리며 결과를 같은 request에서 받는 모델이고, asynchronous flow는 작업을 durable하게 접수한 뒤 나중에 처리·조회·알림하는 모델입니다. 비동기라고 해서 실패가 사라지지 않으며, “접수됨”과 “완료됨”을 구분하는 state contract가 필요합니다.

### user latency와 workflow를 분리한다

```text
POST ─▶ validate + persist PENDING ─▶ 202 operationId
                                      └─ worker/event ─▶ COMPLETE/FAILED
GET status ─▶ durable outcome
```

사용자가 즉시 결과를 필요로 하고 작업이 짧으며 local transaction으로 묶을 수 있으면 synchronous가 단순합니다. 외부 API, 긴 batch, fan-out, retry 또는 사용자 요청보다 긴 처리라면 접수·진행·완료를 비동기 경계로 나누는 편이 timeout과 thread 점유를 줄일 수 있습니다.

### delivery와 사용자 상태를 설계한다

async command에는 operation identity, retry/DLQ, idempotency, timeout, cancel과 progress가 필요합니다. sync API도 downstream timeout 뒤 side effect가 남을 수 있으므로 성공/실패만으로 충분하지 않을 수 있습니다. polling, webhook, WebSocket 중 사용자에게 outcome을 전달하는 방식을 선택합니다.

### transaction 경계를 숨기지 않는다

DB commit과 message publish가 서로 다른 시스템이면 outbox·recovery를 두고, message가 중복·지연되어도 handler가 안전하게 처리되게 합니다. async로 바꾸면 read-after-write freshness와 ordering이 달라질 수 있으므로 API 문서에 명시합니다.

### 문제를 풀 때 확인할 것

1. caller가 response 시점에 반드시 알아야 하는 결과를 정합니다.
2. 작업 수명·fan-out·외부 side effect·retry 가능성을 계산합니다.
3. accepted/pending/complete/failed/cancelled 상태를 정의합니다.
4. deadline·delivery·idempotency·replay와 notification을 설계합니다.
5. sync/async 전환이 freshness·ordering·ownership을 바꾸는지 검증합니다.

### 면접에서 설명한다면

짧고 즉시 결과가 필요하며 local transaction으로 끝나는 흐름은 synchronous가 단순하고, 긴·fan-out·외부 의존 workflow는 durable accept와 asynchronous processing으로 분리할 수 있습니다. 이때 202가 완료를 뜻하지 않도록 operation state, idempotency, retry/DLQ, outcome 조회와 freshness 계약을 함께 설계합니다.
