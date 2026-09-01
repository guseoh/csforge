---
kind: concept
contentKey: messaging.core.workflow.backpressure-capacity
topicContentKey: messaging.core.workflow
slug: backpressure-capacity
title: "backpressure와 consumer capacity"
summary: "producer rate와 consumer 처리 capacity 차이가 lag·memory·latency를 만드는 이유와 flow control을 이해한다"
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
# backpressure와 consumer capacity

Producer가 초당 10,000개를 만들고 consumer가 초당 6,000개만 처리하면 남은 4,000개는 lag로 쌓입니다. backlog가 늘어나는 동안 broker storage, consumer memory, 처리 latency와 retry 비용도 함께 증가합니다.

```text
producer 10k/s ─▶ broker ─▶ consumer 6k/s
                         lag +4k/s
```

### queue가 무한 buffer는 아니다

broker retention이 충분해도 늦은 message는 사용자에게 오래된 결과를 만들 수 있고, consumer가 poll한 뒤 memory에 무제한으로 쌓으면 process OOM이 될 수 있습니다. batch size, in-flight 작업 수, fetch·poll 간격과 retention을 capacity 계약으로 정합니다.

### backpressure 선택지

- producer rate limit 또는 admission control
- consumer worker·partition 확장
- 무거운 작업을 별도 topic으로 분리
- 낮은 우선순위 event drop/compaction
- lag threshold 초과 시 처리 속도 조정·알림

확장은 partition 수와 downstream DB connection capacity를 함께 봐야 합니다. consumer 수만 늘리면 DB pool과 외부 API가 먼저 포화될 수 있습니다.

### retry가 backlog를 키울 수 있다

실패 message를 즉시 같은 partition에서 retry하면 신규 message가 처리되지 못하고 lag가 더 커집니다. retry topic과 delay, DLQ를 분리하면 원래 traffic의 head-of-line blocking을 줄일 수 있지만 ordering 요구와 duplicate 정책을 다시 확인해야 합니다.

### 문제를 풀 때 확인할 것

1. producer/consumer 처리율과 backlog 증가율을 측정합니다.
2. in-flight memory와 broker retention을 계산합니다.
3. partition 확장이 downstream capacity를 넘지 않는지 봅니다.
4. retry가 정상 traffic을 막는지 확인합니다.
5. lag threshold, freshness SLA와 recovery 시간을 정합니다.

### 면접에서 설명한다면

Backpressure는 producer가 consumer capacity보다 빠를 때 backlog·lag·memory·latency가 증가하는 문제입니다. producer rate limit, consumer/partition 확장, retry 분리와 DLQ를 선택하되 broker만 확장하면 downstream DB·외부 API가 포화될 수 있으므로 end-to-end capacity를 계산해야 합니다.

