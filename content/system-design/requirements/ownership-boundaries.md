---
kind: concept
contentKey: system-design.core.requirements.ownership-boundaries
topicContentKey: system-design.core.requirements
slug: ownership-boundaries
title: "data ownership과 consistency boundary"
summary: "aggregate·source of truth·derived view와 team/API ownership을 분리한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://microservices.io/patterns/monolithic.html"
    title: "Microservices.io: Monolithic Architecture"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "subdomain과 modular boundary, runtime/design-time coupling 확인"
  - url: "https://microservices.io/patterns/data/saga.html"
    title: "Microservices.io: Saga Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "service별 database ownership과 cross-boundary transaction 확인"
---
# data ownership과 consistency boundary

System의 경계는 URL이나 deploy unit만으로 정해지지 않습니다. 어떤 aggregate가 canonical state를 소유하고 어떤 read model·cache·search index가 derived projection인지, 누가 invariant와 migration을 책임지는지를 정해야 coupling과 recovery를 판단할 수 있습니다.

```text
owner ──local transaction──▶ canonical state
  └─ event/outbox ─▶ derived view / search / cache
                         └─ rebuild 가능해야 함
```

### source of truth를 하나씩 지정한다

주문 상태를 API DB, cache, search index가 각각 수정하게 두면 conflict와 recovery가 불가능해집니다. PostgreSQL 같은 canonical store가 state transition을 소유하고, cache·Elasticsearch·analytics는 event 또는 재생성으로 따라가는 projection으로 둡니다. projection이 늦거나 사라졌을 때 사용자에게 보일 상태도 정의합니다.

### boundary는 invariant를 보호해야 한다

한 transaction으로 지켜야 하는 invariant가 여러 service에 걸치면 local transaction과 saga·reservation·compensation의 비용이 생깁니다. 반대로 모든 것을 하나의 shared database에 넣으면 runtime consistency는 쉽지만 schema·배포·team coupling이 커집니다. 경계는 조직 이름보다 변경 이유와 invariant의 위치로 정합니다.

### API와 ownership을 함께 바꾼다

소유자가 바뀔 때 read/write API, authorization, event schema, migration과 운영 dashboard의 책임을 함께 옮깁니다. cross-owner query를 직접 join할수록 독립 배포와 장애 격리가 약해지므로 API composition·materialized view·비동기 eventual read 중 trade-off를 선택합니다.

### 문제를 풀 때 확인할 것

1. canonical state와 derived projection을 구분합니다.
2. invariant와 transaction boundary의 위치를 적습니다.
3. owner의 write 권한·migration·recovery 책임을 정합니다.
4. cross-boundary query와 consistency/freshness 계약을 둡니다.
5. projection lag·rebuild·schema evolution 경로를 검증합니다.

### 면접에서 설명한다면

각 business state에 canonical owner를 하나 지정하고 cache·search·analytics는 rebuild 가능한 derived view로 둡니다. 함께 지켜야 하는 invariant를 경계 안에 두며, 경계를 넘는 workflow는 API composition·eventual read·saga의 비용을 명시합니다. ownership은 code package뿐 아니라 write 권한·schema·migration·recovery까지 포함합니다.
