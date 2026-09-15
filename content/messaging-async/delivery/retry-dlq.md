---
kind: concept
contentKey: messaging.core.delivery.retry-dlq
topicContentKey: messaging.core.delivery
slug: retry-dlq
title: "재시도와 실패 메시지 격리"
summary: "일시적 실패와 같은 입력으로 반복되는 영구 실패를 구분하고, 제한된 retry와 failed/DLQ workflow로 정상 처리 흐름을 보호한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "consumer processing과 topic 기반 workflow 확인"
  - url: "https://microservices.io/patterns/data/transactional-outbox.html"
    title: "Microservices.io: Transactional Outbox Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "message relay와 재처리·duplicate 운영 맥락 확인"
---
# 재시도와 실패 메시지 격리

Consumer가 실패했다고 같은 message를 무한히 다시 처리하면 복구가 아니라 장애를 증폭시킬 수 있습니다. 먼저 **시간이 지나면 성공할 가능성이 있는 실패인지, 같은 입력으로 계속 실패할 오류인지**를 구분합니다.

```text
consumer failure
   ├─ temporary timeout ─▶ 제한된 retry + backoff
   └─ invalid payload   ─▶ 정상 흐름에서 분리
```

일시적인 network 오류나 downstream unavailable은 재시도 후보가 될 수 있습니다. 반면 schema가 깨졌거나 필수 business data가 없는 message는 반복해도 같은 이유로 실패할 가능성이 큽니다.

### Retry에는 끝이 있어야 한다

재시도 횟수와 backoff를 제한하지 않으면 poison message 하나가 같은 partition을 오래 막을 수 있습니다. Retry하는 동안 신규 message까지 기다려야 하는 구조라면 lag도 계속 커집니다.

```text
M1 success
M2 failure → retry → retry → retry ...
M3, M4, M5 ───────────── waiting
```

Retry topic이나 delayed processing을 사용해 실패 message를 잠시 분리할 수 있지만, 그 순간 원래 partition의 ordering을 그대로 유지할 수 있는지도 다시 판단해야 합니다.

### DLQ는 폐기함이 아니라 복구 대기 상태다

실패 message를 별도 topic이나 store로 옮긴다면 운영자가 **왜 실패했고 어떻게 다시 처리할지** 알 수 있어야 합니다.

```text
failed record
- messageId
- business key
- payload/schema version
- failure reason
- attempt count
- first/last failure time
```

DLQ에 넣었다고 업무 실패가 해결되는 것은 아닙니다. 사용자 상태가 `PROCESSING`으로 영원히 남지 않도록 failed 상태를 노출하거나 수동 보상·재처리 절차가 필요할 수 있습니다.

### 재시도도 중복 실행이다

Remote call이 timeout된 경우 consumer가 실패를 봤더라도 상대 시스템은 이미 처리를 끝냈을 수 있습니다. 같은 message를 재시도하면 side effect가 중복될 수 있으므로 idempotency와 결과 조회가 함께 필요합니다.

Retry/DLQ 설계의 목표는 실패 message를 어디론가 보내는 것이 아니라 **복구 가능한 오류는 제한적으로 다시 시도하고, 반복 실패는 정상 traffic에서 격리한 뒤 사람이 추적 가능한 상태로 남기는 것**입니다.
