---
kind: concept
contentKey: system-design.core.architecture.read-write-models
topicContentKey: system-design.core.architecture
slug: read-write-models
title: "쓰기 모델과 읽기 모델"
summary: "canonical write가 지켜야 할 invariant와 사용자 query에 필요한 read shape를 분리하고 별도 projection의 freshness·rebuild 비용을 판단한다."
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
# 쓰기 모델과 읽기 모델

데이터를 변경할 때 필요한 구조와 화면에서 빠르게 조회할 때 필요한 구조가 항상 같지는 않습니다. 쓰기 모델은 business invariant와 transaction을 안전하게 지키는 것이 우선이고, 읽기 모델은 사용자가 자주 수행하는 filter·sort·aggregation 같은 query에 맞는 형태가 중요합니다.

처음부터 두 저장소를 분리할 필요는 없습니다. 하나의 relational schema가 현재 workload를 충분히 처리한다면 그 구조가 가장 단순합니다. 하지만 특정 read가 반복적인 join·aggregation 때문에 실제 병목이 되고 요구 latency를 만족하지 못한다면 별도 projection이나 denormalized read model을 검토할 수 있습니다.

```text
command
   ↓
canonical write model
   │
   └─ change propagation
          ↓
     read projection
```

별도 read model을 두는 순간 새로운 계약이 생깁니다. Projection은 canonical source보다 늦을 수 있고, update가 실패할 수도 있으며, schema가 바뀌면 backfill이나 rebuild가 필요합니다. 따라서 “조회가 빠르다”만 볼 것이 아니라 허용 stale 시간과 재생성 방법도 함께 정해야 합니다.

Write 직후 사용자가 자신의 변경을 바로 확인해야 한다면 응답에 canonical 결과를 포함하거나 필요한 read path를 별도로 제공할 수 있습니다. 반대로 검색·통계처럼 몇 초의 지연을 허용할 수 있다면 eventual projection이 더 자연스러울 수 있습니다.

System Design에서 중요한 것은 CQRS나 특정 검색 엔진을 먼저 선택하는 것이 아닙니다. **현재 write invariant와 query 요구가 하나의 모델로 충분한지 측정하고, 분리했을 때 생기는 freshness·write amplification·rebuild 비용을 감당할 가치가 있는지 판단하는 것**입니다.
