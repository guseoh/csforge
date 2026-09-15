---
kind: concept
contentKey: messaging.core.semantics.consumer-offset
topicContentKey: messaging.core.semantics
slug: consumer-offset
title: "Consumer Group과 처리 위치"
summary: "record offset, 현재 consumer position과 committed position을 구분하고 crash·rebalance·replay에서 어느 위치부터 다시 처리하는지 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html"
    title: "Apache Kafka API: KafkaConsumer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "consumer position과 committed position, group consumption 계약 확인"
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "consumer group과 partition assignment 기본 개념 확인"
  - url: "https://engineering.linecorp.com/ko/blog/applying-kafka-streams-for-internal-message-delivery-pipeline"
    title: "LINE Engineering: 내부 데이터 파이프라인에 Kafka Streams 적용하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: "Kafka consumer가 topic의 처리 위치를 offset으로 관리하고 여러 consumer가 stream을 처리하는 실제 적용 맥락 확인"
---
# Consumer Group과 처리 위치

같은 topic을 여러 목적에서 독립적으로 읽고 싶다면 consumer group을 분리할 수 있습니다. 반대로 같은 목적의 consumer 여러 개는 하나의 group 안에서 partition을 나눠 처리합니다.

```text
order-events
  ├─ group: search-indexer
  │    ├─ Consumer A → P0
  │    └─ Consumer B → P1
  │
  └─ group: analytics
       └─ 같은 event stream을 별도로 소비
```

### Offset이라는 말 안에도 서로 다른 상태가 있다

Partition의 각 record에는 log 위치인 offset이 있습니다. Consumer를 운영할 때는 여기에 현재 position과 committed position까지 구분해야 합니다.

```text
record offset
→ 특정 record가 partition에서 차지하는 위치

consumer position
→ 다음 poll/fetch에서 읽을 위치

committed position
→ restart나 rebalance 뒤 다시 시작할 기준으로 저장한 위치
```

Record를 가져왔다고 committed position까지 즉시 같은 위치로 이동하는 것은 아닙니다. 그래서 “offset 100까지 읽었다”와 “offset 100까지 처리를 완료했다고 기록했다”는 다른 상태일 수 있습니다.

### 처리 결과와 offset commit 사이에 실패 구간이 생긴다

Consumer가 DB 변경을 먼저 commit한 뒤 process가 죽고, offset은 아직 commit하지 못했다고 해 보겠습니다.

```text
M42 읽음
  │
  ├─ business DB update commit
  │
  X crash
  │
  └─ committed position은 M42 이전
```

재시작하면 M42가 다시 전달될 수 있습니다. 반대로 offset을 먼저 commit한 뒤 실제 business update 전에 crash하면 해당 작업을 다시 읽지 못할 수 있습니다. Delivery semantics가 이 순서와 연결되는 이유입니다.

### Rebalance는 partition의 담당자가 바뀌는 사건이다

Consumer가 추가되거나 사라지면 group이 partition assignment를 다시 나눌 수 있습니다. 새 owner는 committed position을 기준으로 처리를 이어가므로, 이전 consumer의 in-flight 작업과 commit 상태가 맞지 않으면 duplicate나 긴 pause가 발생할 수 있습니다.

Replay도 같은 원리를 이용합니다. 과거 offset부터 다시 읽어 projection을 재구축할 수 있지만, email 전송처럼 되돌리기 어려운 side effect까지 그대로 다시 실행하면 안 됩니다.

Consumer offset을 이해하는 핵심은 숫자를 외우는 것이 아니라 **현재 읽은 위치와 안전하게 처리 완료했다고 기록한 위치 사이에 차이가 있을 수 있고, crash 이후에는 committed position이 복구 기준이 된다는 점**입니다.
