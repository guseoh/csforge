---
kind: concept
contentKey: messaging.core.workflow.backpressure-capacity
topicContentKey: messaging.core.workflow
slug: backpressure-capacity
title: "생산 속도와 Consumer 처리 용량"
summary: "producer가 consumer보다 빠를 때 lag와 지연 시간이 누적되는 이유를 이해하고 producer 제한·consumer 확장·retry 분리로 end-to-end capacity를 조정한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "producer·consumer throughput과 partition 기반 확장 확인"
---
# 생산 속도와 Consumer 처리 용량

Producer가 초당 10,000개의 message를 만들지만 consumer가 초당 6,000개만 처리한다면 남은 4,000개는 매초 backlog로 쌓입니다. Broker가 이를 보관해 주더라도 **사용자가 결과를 보게 되는 시간은 계속 늦어집니다.**

```text
producer 10k/s ─▶ broker ─▶ consumer 6k/s
                         +4k/s lag
```

이 상태가 10분 지속되면 lag는 240만 건까지 늘어날 수 있습니다. 따라서 broker storage가 충분한지만 보는 것으로는 부족합니다.

### Queue는 처리 용량을 만들어 주지 않는다

Message broker는 producer와 consumer의 속도 차이를 잠시 흡수할 수 있지만, consumer의 실제 처리 능력을 늘려 주지는 않습니다. Backlog가 계속 증가한다면 언젠가는 retention, disk, freshness SLA 중 하나가 한계에 도달합니다.

Consumer가 poll한 record를 memory에 무한히 쌓는 것도 해결책이 아닙니다. In-flight 작업 수를 제한하지 않으면 process heap과 downstream connection pool이 먼저 고갈될 수 있습니다.

### 어디를 조절할지 병목을 보고 결정한다

```text
producer rate
   │
   ▼
broker backlog
   │
   ▼
consumer workers
   │
   ▼
DB / external API capacity
```

Consumer 수와 partition 수를 늘리면 처리량이 올라갈 수 있지만 DB connection pool이나 외부 API가 이미 병목이라면 downstream 장애만 키울 수 있습니다. 반대로 중요하지 않은 작업이라면 producer admission control이나 낮은 우선순위 event drop/compaction 같은 정책을 검토할 수도 있습니다.

### Retry도 전체 처리량을 소비한다

실패 message를 즉시 여러 번 retry하면 신규 message를 처리할 capacity가 줄어듭니다. Poison message 하나가 partition을 계속 막는다면 delayed retry나 별도 retry path로 정상 traffic과 분리할 수 있습니다.

```text
consumer capacity 6k/s
  ├─ normal work 5k/s
  └─ retry work  1k/s
```

Retry가 늘어나면 정상 처리에 사용할 수 있는 capacity가 줄어드는 구조입니다.

Backpressure를 다룬다는 것은 queue를 크게 만드는 것이 아니라 **생산률, 소비률, backlog 증가 속도와 downstream 한계를 함께 측정하고 시스템이 감당할 수 있는 속도로 흐름을 제한하는 것**입니다.
