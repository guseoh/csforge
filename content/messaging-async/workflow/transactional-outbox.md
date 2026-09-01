---
kind: concept
contentKey: messaging.core.workflow.transactional-outbox
topicContentKey: messaging.core.workflow
slug: transactional-outbox
title: "transactional outbox"
summary: "DB commit과 message publish 사이 dual-write gap을 outbox·relay·idempotent consumer로 해결한다"
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Microservices.io: Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "business update와 outbox 저장, relay duplicate와 consumer idempotency 확인"
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "broker publish와 consumer delivery 경계 확인"
---
# transactional outbox

주문 row를 DB에 commit한 뒤 Kafka publish를 수행하면 그 사이 process가 죽어 event가 사라질 수 있습니다. 반대로 message를 먼저 publish하고 DB transaction이 rollback되면 존재하지 않는 주문을 downstream이 처리할 수 있습니다.

```text
위험한 dual write
  DB commit ── crash ── Kafka publish 없음

transactional outbox
  DB transaction
    ├─ order row
    └─ outbox row
          │ commit
          ▼
       relay ─▶ broker
```

### outbox는 atomicity 경계를 DB에 둔다

business state와 publish intent를 같은 DB transaction에 저장하면 DB commit이 없을 때 outbox도 남지 않고, commit이 있으면 relay가 나중에 message를 보낼 근거가 남습니다. DB와 broker를 하나의 2PC transaction으로 묶는 대신 durable outbox를 중간 기록으로 사용합니다.

### relay도 duplicate할 수 있다

relay가 broker publish 성공 후 outbox sent 표시 전에 죽으면 재시작 뒤 같은 event를 다시 publish할 수 있습니다. 따라서 outbox는 exactly-once publish를 자동 보장하지 않으며 event id와 idempotent consumer가 필요합니다.

### outbox 운영 비용

outbox가 계속 쌓이면 DB storage와 relay lag가 증가합니다. publisher가 어느 시점까지 처리했는지, 실패 attempt·next retry·dead state를 기록하고 보존 기간과 순서 요구를 정해야 합니다. 같은 aggregate event 순서를 보장하려면 outbox sequence와 relay partition key를 함께 사용합니다.

### 문제를 풀 때 확인할 것

1. DB commit과 broker publish 사이 crash window를 그립니다.
2. business row와 outbox row가 같은 transaction인지 봅니다.
3. relay crash 후 duplicate가 가능한지 확인합니다.
4. consumer idempotency와 event ordering을 연결합니다.
5. outbox backlog·retry·cleanup을 운영 metric으로 둡니다.

### 면접에서 설명한다면

Transactional outbox는 business row와 message publish intent를 같은 DB transaction에 저장하고 별도 relay가 broker로 전달하는 패턴입니다. DB와 broker 사이 dual-write gap을 줄이지만 relay가 publish 후 죽으면 duplicate가 생길 수 있으므로 consumer idempotency·ordering·outbox cleanup까지 설계해야 합니다.

