---
kind: concept
contentKey: system-design.core.architecture.read-write-models
topicContentKey: system-design.core.architecture
slug: read-write-models
title: "read model과 write model"
summary: "transactional write와 query/read projection의 shape·freshness·rebuildability trade-off를 설계한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Microservices.io: Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "canonical write와 derived event publish의 boundary 확인"
  - url: "https://docs.aws.amazon.com/pdfs/wellarchitected/latest/performance-efficiency-pillar/wellarchitected-performance-efficiency-pillar.pdf"
    title: "AWS Well-Architected Framework: Performance Efficiency Pillar"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "data management와 workload별 architecture 선택 확인"
---
# read model과 write model

Write model은 invariant와 transaction을 지키며 canonical state를 변경하는 구조이고, read model은 query shape와 사용자 read latency에 맞춘 projection입니다. 하나의 schema로 모든 read와 write를 해결하려는 대신 access pattern, freshness, rebuildability와 운영 비용을 비교합니다.

### projection은 source of truth가 아니다

```text
command ─▶ canonical DB transaction ─▶ outbox/event
                                      └─ projection ─▶ query model
                                                └─ lag/rebuild 가능
```

Projection update가 늦거나 실패해도 canonical write의 의미를 바꾸지 않아야 합니다. projection에는 source revision·updatedAt을 넣어 lag를 측정하고, event replay나 canonical scan으로 rebuild할 수 있어야 합니다.

### query shape에 맞춰 denormalize한다

목록 화면의 join·aggregation·sorting이 매번 비싸면 materialized view, search index, read replica 또는 precompute를 검토할 수 있습니다. 그 대신 write amplification, stale window, schema evolution, backfill과 consistency boundary가 생깁니다. “read가 많으니 무조건 별도 DB”가 아니라 병목과 요구사항으로 판단합니다.

### write path는 좁게 유지한다

모든 derived view를 같은 transaction에 묶으면 read 성능을 위해 canonical write가 실패할 수 있습니다. 반대로 projection을 비동기로 두면 사용자가 방금 바꾼 상태를 못 볼 수 있으므로 write response에 canonical result를 주거나 session pinning·version watermark를 사용합니다.

### 문제를 풀 때 확인할 것

1. invariant와 canonical write path를 정의합니다.
2. query pattern·sort·filter·read latency를 측정합니다.
3. projection freshness·revision·rebuild contract를 둡니다.
4. denormalization의 write amplification과 backfill 비용을 계산합니다.
5. write 직후 read와 projection outage의 사용자 상태를 정합니다.

### 면접에서 설명한다면

Write model은 canonical invariant와 transaction을, read model은 query shape와 latency를 최적화합니다. read projection은 source of truth가 아니므로 revision·lag·rebuild를 설계하고, denormalization의 write amplification과 stale window를 감수할 가치가 있는지 workload로 판단합니다.
