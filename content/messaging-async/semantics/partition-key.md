---
kind: concept
contentKey: messaging.core.semantics.partition-key
topicContentKey: messaging.core.semantics
slug: partition-key
title: "토픽·파티션·메시지 키"
summary: "파티션이 순서와 병렬 처리의 기본 단위가 되는 이유를 이해하고 메시지 키가 같은 업무 단위를 한 파티션으로 모으는 조건과 편향 위험을 판단한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kafka.apache.org/intro/"
    title: "Apache Kafka Documentation: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "이벤트·메시지 용어와 키 기반 파티셔닝, 토픽 보존·소비자 분리의 기본 동작을 확인한다."
    displayOrder: 1
    relationNote: "같은 키의 이벤트를 한 파티션에 배치하고 파티션별 기록 순서를 유지하는 기본 계약 확인"
  - url: "https://engineering.linecorp.com/ko/blog/how-line-openchat-server-handles-extreme-traffic-spikes"
    title: "LINE Engineering: LINE 오픈챗 서버가 100배 급증하는 트래픽을 다루는 방법"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: section
    recommendation: "핫 챗의 파티션 집중, offset lag와 소비자 자원 부하를 관찰한 운영 사례를 확인한다."
    displayOrder: 2
    relationNote: "특정 채팅 키로 한 Kafka 파티션에 트래픽이 집중되는 핫 파티션 사례 확인"
---
# 토픽·파티션·메시지 키

Kafka 토픽은 하나의 거대한 순차 파일이 아니라 여러 파티션으로 나뉠 수 있습니다. 각 파티션은 레코드가 추가된 순서를 가지며, 컨슈머 그룹은 여러 파티션을 나눠 읽어 병렬 처리합니다.

```text
order-events
  ├─ Partition 0: e1 → e4 → e7
  ├─ Partition 1: e2 → e5
  └─ Partition 2: e3 → e6
```

Kafka가 보장하는 순서는 **토픽 전체가 아니라 각 파티션 안의 레코드 순서**입니다.

### 메시지 키는 관련 메시지를 같은 파티션으로 모으는 재료다

한 주문의 상태 변화가 순서대로 처리되어야 한다면 `orderId` 같은 업무 식별자를 메시지 키로 사용할 수 있습니다.

```text
key=order-42
Placed → Paid → Shipped
       │
       └─ 같은 partition으로 routing
```

같은 키가 같은 파티션으로 가는 프로듀서 설정을 사용하면 같은 업무 단위의 이벤트를 한 파티션에 모으기 쉽습니다. 다만 사용자 지정 파티셔너나 파티션 수 변경처럼 라우팅 규칙이 바뀌면 키와 파티션의 대응도 달라질 수 있으므로 “같은 키는 영원히 같은 물리 파티션”이라고 일반화하면 안 됩니다.

### 파티션 수는 병렬 처리 폭과 연결된다

일반적인 컨슈머 그룹에서는 한 파티션이 한 시점에 한 그룹 구성원에게 할당됩니다.

```text
3 partitions
P0 → Consumer A
P1 → Consumer B
P2 → Consumer C
Consumer D → 할당받을 partition 없음
```

파티션을 늘리면 동시에 처리할 수 있는 범위를 키울 수 있지만, 순서가 필요한 단위도 더 세분화됩니다. 컨슈머 수만 늘린다고 파티션 수를 넘어 처리량이 계속 증가하지도 않습니다.

### 키 편향은 핫 파티션을 만든다

특정 테넌트나 업무 단위에 트래픽이 몰리면 그 키가 배치된 파티션만 바빠질 수 있습니다. 이 경우 전체 브로커 사용량은 여유가 있어도 한 파티션의 lag가 빠르게 증가합니다.

따라서 키를 고를 때는 **어떤 업무 단위의 순서를 묶을 것인지**와 **트래픽이 얼마나 균등하게 퍼지는지**를 함께 봐야 합니다. 순서를 지키겠다고 모든 메시지를 하나의 키로 묶으면 순서는 단순해지지만 병렬성을 거의 잃게 됩니다.
