---
kind: concept
contentKey: messaging.core.workflow.schema-evolution
topicContentKey: messaging.core.workflow
slug: schema-evolution
title: "message schema evolution"
summary: "producer·consumer가 다른 message version으로 공존할 때 compatibility와 replay migration을 설계한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "topic·consumer·message retention과 version 공존 경계 확인"
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Microservices.io: Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "message payload를 durable event로 relay하는 운영 맥락 확인"
  - url: "https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html"
    title: "Confluent Documentation: Schema Evolution and Compatibility"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "Schema Registry의 backward·forward·full·transitive compatibility 정의와 format별 제약 확인"
---
# message schema evolution

Producer와 consumer가 동시에 배포되지 않는 비동기 시스템에서는 한동안 old consumer가 new message를 읽고, replay worker가 과거 message를 새 code로 읽습니다. 따라서 message schema는 단순한 내부 DTO가 아니라 retention 기간과 독립 배포 기간 동안 유지되는 계약입니다.

```text
old/new producer ─▶ topic에 old/new payload 공존 ─▶ old/new consumer
```

### additive change도 serialization contract에 달려 있다

optional field를 추가하는 것은 unknown field를 무시하고 default를 안전하게 처리하는 consumer라면 비교적 호환적일 수 있지만, strict decoder나 exhaustive enum switch는 새 field/value에서 실패할 수 있습니다. Field 삭제·type/unit 변경·의미 변경은 구조가 parse되어도 business 결과를 깨뜨릴 수 있습니다. 어떤 변경이 실제 backward/forward compatible한지는 Avro·Protobuf·JSON Schema 같은 format과 schema registry policy에 따라 달라집니다.

### backward와 forward의 방향을 reader와 data로 고정한다

Confluent Schema Registry의 compatibility 용어를 기준으로 하면:

```text
BACKWARD: new schema/consumer  ─▶ old data를 읽을 수 있음
FORWARD:  old schema/consumer  ─▶ new data를 읽을 수 있음
FULL:     양방향 모두 호환
```

`BACKWARD`가 모든 역사 version과 호환된다는 뜻도 아닙니다. Non-transitive mode는 보통 바로 이전 version과 비교하고, `BACKWARD_TRANSITIVE`처럼 transitive mode를 사용해야 모든 이전 registered schema와의 compatibility를 검사합니다. 따라서 “backward compatible”이라는 말만으로 replay 가능한 전체 retention 기간을 보장했다고 단정하지 않습니다.

### rollout 순서도 compatibility 방향의 일부다

Backward-only policy에서는 new consumer가 old data를 읽을 수 있으므로 producer보다 consumer를 먼저 upgrade하는 전략이 자연스럽습니다. Forward-only는 반대로 old consumer가 new data를 읽는 방향을 보호합니다. 실제 배포에서는 schema registry 설정뿐 아니라 consumer code의 business default·enum 처리·required field 가정을 함께 테스트합니다.

### replay는 migration 설계의 일부다

retention message를 재생할 때 현재 domain schema·idempotency·ordering이 과거 payload를 처리할 수 있어야 합니다. 불가능하면 version adapter, migration consumer, 새 projection rebuild 경계를 두고 운영 중 replay가 production side effect를 중복 실행하지 않게 해야 합니다.

### 문제를 풀 때 확인할 것

1. old/new producer·consumer가 공존하는 기간을 정합니다.
2. 사용하는 serialization format과 registry policy에서 field add/delete/type/enum 변경의 실제 compatibility를 확인합니다.
3. backward/forward/full과 transitive 여부를 구분합니다.
4. rollout 순서와 replay retention 기간이 compatibility 범위에 포함되는지 확인합니다.
5. historical replay가 외부 side effect를 다시 실행하지 않도록 migration/rebuild 경계를 둡니다.

### 면접에서 설명한다면

Message schema는 producer·consumer 독립 배포와 replay 때문에 장기 계약입니다. Confluent 용어에서 backward는 새 consumer가 old data를 읽는 방향, forward는 old consumer가 new data를 읽는 방향이며 transitive 여부에 따라 검사 범위도 달라집니다. Additive change조차 serialization format과 consumer 가정에 따라 breaking일 수 있으므로 registry policy, rollout 순서, replay를 함께 설계해야 합니다.
