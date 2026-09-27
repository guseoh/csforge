---
kind: concept
contentKey: messaging.core.semantics.consumer-offset
topicContentKey: messaging.core.semantics
slug: consumer-offset
title: "컨슈머 그룹과 처리 위치"
summary: "record offset, 현재 consumer position과 committed position을 구분하고 crash·rebalance·replay에서 어느 위치부터 다시 처리하는지 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html"
    title: "Apache Kafka 4.2 API: KafkaConsumer"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "현재 소비 위치와 확정 오프셋, 컨슈머 그룹별 파티션 할당·재조정 계약을 확인한다."
    displayOrder: 1
    relationNote: "컨슈머 위치와 확정 위치, 그룹별 파티션 할당·재조정 계약 확인"
  - url: "https://engineering.linecorp.com/ko/blog/how-line-openchat-server-handles-extreme-traffic-spikes"
    title: "LINE Engineering: LINE 오픈챗 서버가 100배 급증하는 트래픽을 다루는 방법"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: section
    recommendation: "핫 챗의 파티션 집중, offset lag와 소비자 자원 부하를 관찰한 운영 사례를 확인한다."
    displayOrder: 2
    relationNote: "특정 파티션의 오프셋 랙과 소비자 부하를 관측한 운영 사례 확인"
---
# 컨슈머 그룹과 처리 위치

같은 토픽을 여러 목적에서 독립적으로 읽고 싶다면 컨슈머 그룹(Consumer Group)을 분리할 수 있습니다. 반대로 같은 목적의 컨슈머 여러 개는 하나의 그룹 안에서 파티션을 나눠 처리합니다.

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

Offset은 partition log 안의 위치 식별자이지 처리한 record 수와 같다는 뜻은 아닙니다. Compaction이나 transaction record 때문에 번호 사이에 빈 구간이 생길 수 있습니다.

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
