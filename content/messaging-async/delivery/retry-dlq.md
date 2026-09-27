---
kind: concept
contentKey: messaging.core.delivery.retry-dlq
topicContentKey: messaging.core.delivery
slug: retry-dlq
title: "재시도와 실패 메시지 격리"
summary: "일시적 실패와 같은 입력에서 반복되는 영구적 실패를 구분하고, 제한된 재시도와 실패 메시지 격리(DLQ) 흐름으로 정상 처리 경로를 보호한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-kafka/reference/retrytopic.html"
    title: "Spring for Apache Kafka: Non-Blocking Retries"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Spring Kafka의 비차단 재시도·DLT 구성과 순서 보장 경계를 확인한다."
    displayOrder: 1
    relationNote: "제한된 재시도·재시도 토픽·DLT 구성과 비차단 재시도에서 순서 보장이 바뀌는 경계 확인"
  - url: "https://engineering.linecorp.com/ko/blog/decaton-case-studies"
    title: "LINE Engineering: Kafka를 이용한 작업 큐 라이브러리 'Decaton' 활용 사례"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: section
    recommendation: "Kafka 작업 큐에서 재시도·지연 처리·파티션 병렬 작업을 구성한 적용 사례를 확인한다."
    displayOrder: 2
    relationNote: "실패한 Kafka 작업을 별도 retry queue에서 지연 후 재처리하는 실무 사례 확인"
---
# 재시도와 실패 메시지 격리

컨슈머가 실패했다고 같은 메시지를 무한히 다시 처리하면 복구가 아니라 장애를 증폭시킬 수 있습니다. 먼저 **시간이 지나면 성공할 가능성이 있는 실패인지, 같은 입력으로 계속 실패할 오류인지**를 구분합니다.

```text
consumer failure
   ├─ temporary timeout ─▶ 제한된 retry + backoff
   └─ invalid payload   ─▶ 정상 흐름에서 분리
```

일시적인 네트워크 오류나 하위 시스템 사용 불가는 재시도 후보가 될 수 있습니다. 반면 스키마가 깨졌거나 필수 업무 데이터가 없는 메시지는 반복해도 같은 이유로 실패할 가능성이 큽니다.

### 재시도에는 끝이 있어야 한다

재시도 횟수와 대기 간격(backoff)을 제한하지 않으면 독성 메시지(poison message) 하나가 같은 파티션을 오래 막을 수 있습니다. 재시도하는 동안 신규 메시지까지 기다려야 하는 구조라면 lag도 계속 커집니다.

```text
M1 success
M2 failure → retry → retry → retry ...
M3, M4, M5 ───────────── waiting
```

재시도 토픽이나 지연 처리를 사용해 실패 메시지를 잠시 분리할 수 있지만, 그 순간 원래 파티션의 순서를 그대로 유지할 수 있는지도 다시 판단해야 합니다.

### DLQ는 폐기함이 아니라 복구 대기 상태다

실패 메시지를 별도 토픽이나 저장소로 옮긴다면 운영자가 **왜 실패했고 어떻게 다시 처리할지** 알 수 있어야 합니다.

```text
failed record
- messageId
- business key
- payload/schema version
- failure reason
- attempt count
- first/last failure time
```

DLQ에 넣었다고 업무 실패가 해결되는 것은 아닙니다. 사용자 상태가 `PROCESSING`으로 영원히 남지 않도록 실패 상태를 노출하거나 수동 보상·재처리 절차가 필요할 수 있습니다.

### 재시도도 중복 실행이다

원격 호출이 타임아웃된 경우 컨슈머가 실패를 봤더라도 상대 시스템은 이미 처리를 끝냈을 수 있습니다. 같은 메시지를 재시도하면 외부 효과가 중복될 수 있으므로 멱등 처리와 결과 조회가 함께 필요합니다.

재시도/DLQ 설계의 목표는 실패 메시지를 어디론가 보내는 것이 아니라 **복구 가능한 오류는 제한적으로 다시 시도하고, 반복 실패는 정상 트래픽에서 격리한 뒤 사람이 추적 가능한 상태로 남기는 것**입니다.
