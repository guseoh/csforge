---
kind: concept
contentKey: messaging.core.semantics.consumer-offset
topicContentKey: messaging.core.semantics
slug: consumer-offset
title: "컨슈머 그룹과 처리 위치"
summary: "레코드 오프셋, 현재 소비 위치와 확정 위치를 구분하고 장애·리밸런싱·재생에서 어느 위치부터 다시 처리하는지 이해한다."
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

### 오프셋이라는 말 안에도 서로 다른 상태가 있다

파티션의 각 레코드에는 로그 위치인 오프셋(offset)이 있습니다. 컨슈머를 운영할 때는 여기에 현재 소비 위치와 확정 위치까지 구분해야 합니다.

```text
record offset
→ 특정 record가 partition에서 차지하는 위치

consumer position
→ 다음 poll/fetch에서 읽을 위치

committed position
→ restart나 rebalance 뒤 다시 시작할 기준으로 저장한 위치
```

오프셋은 파티션 로그 안의 위치 식별자이지 처리한 레코드 수와 같다는 뜻은 아닙니다. 로그 압축(compaction)이나 트랜잭션 관련 레코드 때문에 번호 사이에 빈 구간이 생길 수 있습니다.

레코드를 가져왔다고 확정 위치까지 즉시 같은 위치로 이동하는 것은 아닙니다. 그래서 “오프셋 100까지 읽었다”와 “오프셋 100까지 처리를 완료했다고 기록했다”는 다른 상태일 수 있습니다.

### 처리 결과와 오프셋 확정 사이에 실패 구간이 생긴다

컨슈머가 DB 변경을 먼저 커밋한 뒤 프로세스가 종료되고, 오프셋은 아직 확정하지 못했다고 해 보겠습니다.

```text
M42 읽음
  │
  ├─ 업무 DB 변경 commit
  │
  X 프로세스 종료
  │
  └─ committed position은 M42 이전
```

재시작하면 M42가 다시 전달될 수 있습니다. 반대로 오프셋을 먼저 확정한 뒤 실제 업무 변경 전에 프로세스가 종료되면 해당 작업을 다시 읽지 못할 수 있습니다. 전달 보장이 이 순서와 연결되는 이유입니다.

### 리밸런싱은 파티션의 담당자가 바뀌는 사건이다

컨슈머가 추가되거나 사라지면 그룹이 파티션 할당을 다시 나눌 수 있습니다. 새 담당자는 확정 위치를 기준으로 처리를 이어가므로, 이전 컨슈머의 진행 중 작업과 확정 상태가 맞지 않으면 중복 처리나 긴 일시 중지가 발생할 수 있습니다.

과거 오프셋부터 다시 읽는 재생(replay)도 같은 원리를 이용합니다. 프로젝션을 다시 만들 수 있지만 이메일 전송처럼 되돌리기 어려운 외부 효과까지 그대로 다시 실행하면 안 됩니다.

컨슈머 오프셋을 이해하는 핵심은 숫자를 외우는 것이 아니라 **현재 읽은 위치와 안전하게 처리 완료했다고 기록한 위치 사이에 차이가 있을 수 있고, 장애 이후에는 확정 위치가 복구 기준이 된다는 점**입니다.
