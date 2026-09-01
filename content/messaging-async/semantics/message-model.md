---
kind: concept
contentKey: messaging.core.semantics.message-model
topicContentKey: messaging.core.semantics
slug: message-model
title: "command·event·message model"
summary: "command와 event의 의도·source·consumer coupling을 구분하고 비동기 message contract를 설계한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "producer·consumer·topic 기반 event streaming 개념 확인"
---
# command·event·message model

비동기 시스템에서 “메시지를 보낸다”는 말만으로는 의도가 드러나지 않습니다. Command는 특정 consumer에게 **무엇을 하라고 요청**하고, Event는 이미 일어난 사실을 **무엇이 발생했는지 알리는** 표현입니다. 둘 다 broker를 통과할 수 있지만 producer와 consumer의 결합 방향이 다릅니다.

```text
Command:  Billing ── ChargeOrder ──▶ Payment service
Event:    Order service ── OrderPlaced ──▶ 여러 interested consumer
```

### command와 event의 source가 다르다

Command producer는 대상과 처리 의도를 알고 있어야 합니다. Event producer는 자신의 transaction에서 사실을 기록하고, 누가 소비할지는 더 느슨하게 둘 수 있습니다. 그렇다고 event가 schema나 의미가 없는 broadcast라는 뜻은 아닙니다. event에는 발생 주체·aggregate id·version·발생 시각 등 replay와 순서 판단에 필요한 계약이 필요합니다.

### message는 durable state가 아니다

broker에 message가 저장되어도 canonical business row와 같은 의미는 아닙니다. consumer가 DB에 반영하기 전 실패할 수 있고, retention이 지나면 replay가 불가능할 수 있습니다. message payload에 필요한 사실을 담되 consumer가 현재 DB를 조회해야 하는지, event snapshot을 신뢰할지 명시해야 합니다.

```text
OrderPlaced
  ├─ orderId
  ├─ aggregateVersion
  ├─ occurredAt
  └─ 필요한 당시 가격·통화 등 event facts
```

### 비동기는 완료 시점을 바꾼다

HTTP 응답 전에 필요한 validation·canonical write를 message로 미루면 client가 성공을 받은 뒤 실제 주문이 존재하지 않을 수 있습니다. 반면 검색 색인·분석처럼 eventual completion을 허용할 수 있는 작업은 event consumer로 분리할 수 있습니다.

### 문제를 풀 때 확인할 것

1. 이것이 명령인지 이미 발생한 사실인지 구분합니다.
2. producer가 특정 consumer와 response를 기대하는지 확인합니다.
3. message가 표현하는 canonical state와 retention을 정합니다.
4. 응답 전에 반드시 끝나야 하는 작업인지 판단합니다.
5. event id·aggregate id·version 같은 replay 정보를 포함합니다.

### 면접에서 설명한다면

Command는 특정 대상에게 처리를 요청하는 메시지이고 event는 이미 발생한 사실을 알리는 메시지입니다. 비동기로 분리할수록 완료 시점이 늦어지고 consumer retry·replay·schema 계약이 필요하므로, 응답 전 canonical state와 나중에 완료 가능한 derived work를 구분해야 합니다.

