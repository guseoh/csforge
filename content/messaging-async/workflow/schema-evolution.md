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
    title: "Pattern: Transactional Outbox"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "message payload를 durable event로 relay하는 운영 맥락 확인"
---
# message schema evolution

Producer와 consumer가 동시에 배포되지 않는 비동기 시스템에서는 한동안 old consumer가 new message를 읽고, replay worker가 과거 message를 새 code로 읽습니다. 따라서 message schema는 단순한 내부 DTO가 아니라 retention 기간 동안 유지되는 계약입니다.

```text
old consumer ─┐
              ├─ topic ─▶ old/new message version 공존
new consumer ─┘
```

### additive change도 소비자 가정에 달려 있다

optional field를 추가하는 것은 unknown field를 무시하는 consumer라면 비교적 안전하지만, strict decoder나 exhaustive enum switch는 새 값에서 실패할 수 있습니다. field 삭제·type/unit 변경·의미 변경은 구조가 parse되어도 business 결과를 깨뜨릴 수 있습니다.

### version과 compatibility를 명시한다

payload에 schema version을 넣거나 topic을 분리하고, consumer가 지원하는 version 범위를 검증합니다. 일반적인 schema-evolution 용어에서 **backward compatibility**는 새 reader/consumer가 과거에 기록된 old message를 읽을 수 있는 방향이고, **forward compatibility**는 old reader/consumer가 새 producer가 기록한 new message를 읽을 수 있는 방향입니다. 실제 serialization format이나 schema registry가 이 용어를 어떻게 정의하고 검사하는지는 해당 도구의 계약으로 다시 확인합니다.

```json
{"eventType":"OrderPlaced","schemaVersion":2,"orderId":"o-7","currency":"KRW"}
```

### replay는 migration 설계의 일부다

retention message를 재생할 때 현재 domain schema·idempotency·ordering이 과거 payload를 처리할 수 있어야 합니다. 불가능하면 version adapter, migration consumer, 새 projection rebuild 경계를 두고 운영 중 replay가 production side effect를 중복 실행하지 않게 해야 합니다.

### 문제를 풀 때 확인할 것

1. old/new producer·consumer가 공존하는 기간을 정합니다.
2. field add/delete/type/meaning 변경의 compatibility를 봅니다.
3. schema version·topic·adapter 중 선택합니다.
4. replay와 DLQ가 새 schema에서 동작하는지 확인합니다.
5. message consumer가 unknown field/enum을 어떻게 처리하는지 테스트합니다.

### 면접에서 설명한다면

Message schema는 producer와 consumer가 독립 배포되고 replay될 수 있으므로 장기 계약입니다. Additive field도 strict consumer에서는 breaking일 수 있고 type·unit·의미 변경은 더 위험합니다. backward/forward compatibility의 방향을 consumer와 data version 기준으로 명확히 한 뒤 version·adapter와 replay/idempotency를 배포 전략에 포함해야 합니다.

