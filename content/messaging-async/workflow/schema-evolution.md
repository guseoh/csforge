---
kind: concept
contentKey: messaging.core.workflow.schema-evolution
topicContentKey: messaging.core.workflow
slug: schema-evolution
title: "메시지 스키마의 호환 가능한 진화"
summary: "producer와 consumer가 다른 version으로 공존하고 과거 message를 replay하는 환경에서 backward/forward compatibility와 rollout 순서를 설계한다."
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
# 메시지 스키마의 호환 가능한 진화

비동기 시스템에서는 producer와 consumer를 동시에 배포하기 어렵습니다. Topic 안에는 이전 version message가 오래 남아 있을 수 있고, 장애 복구나 projection 재구축을 위해 과거 record를 다시 읽기도 합니다. 그래서 message payload는 내부 DTO보다 **더 긴 시간 동안 여러 버전의 코드가 공유하는 계약**이 됩니다.

```text
old producer ─┐
              ├─ topic: old/new payload 공존 ─▶ old/new consumer
new producer ─┘
```

### 필드 추가도 consumer 가정에 따라 달라진다

Optional field를 하나 추가해도 old consumer가 unknown field를 거부하면 breaking change가 될 수 있습니다. Enum 값 추가 역시 old code가 모든 값을 exhaustive하게 처리한다고 가정했다면 실패할 수 있습니다.

반대로 field 삭제나 type·단위·의미 변경은 JSON parsing 자체는 성공해도 business 의미를 깨뜨릴 수 있습니다.

따라서 “field 추가는 항상 안전하다”처럼 형식만 보고 판단하지 않고 사용하는 serialization format과 consumer code의 실제 contract를 확인합니다.

### Backward와 forward는 읽는 방향을 기준으로 본다

Schema Registry에서 사용하는 일반적인 용어는 다음처럼 이해할 수 있습니다.

```text
BACKWARD
새 consumer/schema가 이전 data를 읽을 수 있음

FORWARD
이전 consumer/schema가 새 data를 읽을 수 있음

FULL
양방향 모두 호환
```

또한 non-transitive 정책은 직전 version만 비교할 수 있고, transitive 정책은 더 오래된 version까지 compatibility를 검사합니다. Retention 기간 전체를 replay해야 한다면 어느 범위까지 보장하는지 확인해야 합니다.

### Rollout 순서도 호환성 설계의 일부다

새 consumer가 이전 message를 읽을 수 있는 backward compatibility가 확보됐다면 consumer를 먼저 배포하고 producer를 나중에 바꾸는 식의 단계적 rollout이 가능합니다.

```text
1. 새 consumer 배포
   └─ old payload 처리 가능
2. 새 producer 배포
   └─ new payload 생산
3. old consumer 제거
```

실제 순서는 compatibility 방향과 제품 배포 구조에 따라 달라집니다.

### Replay는 가장 오래된 계약을 다시 만난다

현재 코드가 오늘 들어오는 message만 처리할 수 있어도 수개월 전 retained message를 replay하지 못한다면 projection rebuild가 실패할 수 있습니다. 필요한 경우 version adapter나 migration consumer를 두고, replay가 과거 email·결제 같은 side effect까지 다시 실행하지 않게 처리 경계를 나눕니다.

메시지 schema evolution의 핵심은 registry 옵션 이름이 아니라 **독립 배포되는 producer/consumer와 retained message가 어느 기간 동안 함께 존재하는지 파악하고 그 전체 기간을 읽을 수 있게 변경하는 것**입니다.
