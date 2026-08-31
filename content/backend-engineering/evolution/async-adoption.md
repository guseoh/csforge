---
kind: concept
contentKey: backend.core.evolution.async-adoption
topicContentKey: backend.core.evolution
slug: async-adoption
title: "비동기 처리 도입 판단"
summary: "응답 경로에서 반드시 끝나야 하는 일과 나중에 완료되어도 되는 일을 분리하고, 비동기화가 만드는 delivery·retry·관측 책임을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "DB 상태 변경과 비동기 메시지 발행 사이의 일관성 문제를 이해하는 참고 자료다."
---
# 비동기 처리 도입 판단

요청이 느리다고 해서 모든 작업을 queue로 넘기면 시스템이 빨라지는 것은 아니다. 비동기화는 사용자가 결과를 기다리지 않아도 되는 작업을 응답 경로에서 분리하는 대신, "나중에 반드시 실행되는가", "두 번 실행되면 어떻게 되는가", "실패를 누가 보는가"라는 새로운 책임을 만든다.

### 먼저 완료 시점을 분류한다

```text
주문 요청
  │
  ├─ 재고 예약       ← 응답 전에 성공 여부 필요
  ├─ 주문 저장       ← 응답 전에 필요
  ├─ 검색 색인       ← 나중에 가능
  └─ 분석 이벤트     ← 나중에 가능
```

사용자가 주문 성공 응답을 받았는데 주문 저장 자체가 아직 queue에 있다면 실패 시 의미가 복잡해진다. 반면 검색 색인이나 analytics는 지연 허용이 더 크다.

### queue는 실패를 없애지 않고 이동시킨다

producer가 DB commit 후 메시지 발행 전에 죽으면 canonical state는 바뀌었지만 event가 사라질 수 있다. 반대로 message를 먼저 발행하고 DB transaction이 rollback되면 존재하지 않는 상태를 소비자가 처리할 수 있다. 이런 이유로 transactional outbox 같은 패턴을 검토한다.

```text
DB transaction
  ├─ business row
  └─ outbox row
       │ commit
       ▼
publisher → broker → consumer
```

### consumer는 중복을 견뎌야 한다

많은 메시징 시스템은 실패 복구 과정에서 동일 message를 다시 전달할 수 있다. 따라서 consumer side idempotency, retry, dead-letter/실패 상태, observability를 설계해야 한다.

비동기는 구현 기술보다 **업무상 완료 시점을 늦춰도 되는가**가 먼저다. 그 답이 yes일 때 delivery와 recovery 비용을 감수할 가치가 있는지 비교한다.
