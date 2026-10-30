---
kind: concept
contentKey: system-design.core.requirements.ownership-boundaries
topicContentKey: system-design.core.requirements
slug: ownership-boundaries
title: "데이터 소유권과 일관성 경계"
summary: "어떤 component가 canonical state와 invariant를 소유하고 어떤 데이터가 rebuild 가능한 derived view인지 구분해 transaction·API·recovery 경계를 설계한다."
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
# 데이터 소유권과 일관성 경계

시스템을 여러 component로 나눌 때 가장 먼저 정해야 할 것 중 하나가 **누가 데이터를 수정할 권한과 책임을 가지는가**입니다. 같은 주문 상태를 여러 DB·cache·search index가 각각 자신의 판단으로 수정하면 충돌이 발생했을 때 어느 값을 복구해야 하는지 알기 어렵습니다.

그래서 business state마다 canonical owner를 명시하고, 다른 저장소는 필요한 경우 그 상태에서 파생된 read model이나 cache로 둡니다.

```text
canonical owner
   │ local transaction
   ▼
source of truth
   │
   ├─ event → search projection
   └─ cache / analytics view
             └─ 필요하면 재생성 가능
```

이 경계는 단순히 DB 테이블의 위치를 정하는 문제가 아닙니다. 어떤 invariant를 같은 transaction 안에서 지킬지, 누가 schema migration과 recovery를 담당할지, 외부에는 어떤 API를 통해 변경을 허용할지도 함께 정합니다.

한 transaction으로 반드시 지켜야 하는 규칙이 여러 경계에 걸쳐 있다면 분산 coordination 비용이 커집니다. 반대로 모든 기능이 하나의 shared database를 자유롭게 수정하면 지금은 단순해 보여도 module 간 변경과 배포가 강하게 결합됩니다. 그래서 boundary는 기술 이름보다 **같이 변하는 규칙과 소유권**을 중심으로 잡는 편이 좋습니다.

Derived view는 canonical owner와 다른 freshness를 가질 수 있습니다. Search index가 몇 초 늦을 수 있는지, projection이 사라졌을 때 다시 만들 수 있는지 같은 조건도 architecture 계약에 포함됩니다.

소유권을 명확히 하면 이후 synchronous/asynchronous boundary나 service 분리를 검토할 때도 판단 기준이 생깁니다. 핵심은 component 수를 늘리는 것이 아니라 **한 상태의 authoritative writer와 invariant 책임을 분명하게 만드는 것**입니다.
