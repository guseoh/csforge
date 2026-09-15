---
kind: concept
contentKey: backend.core.bulk-batch.batch-recovery
topicContentKey: backend.core.bulk-batch
slug: batch-recovery
title: "Batch 실패 후 재시작과 복구"
summary: "긴 작업의 진행 상태를 durable하게 기록하고 checkpoint와 idempotency를 구분해 중간 실패 후 이미 완료된 작업을 중복하지 않으면서 안전하게 재시작한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-batch/reference/domain.html"
    title: "Spring Batch Domain Language"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Job, Step, JobExecution과 재시작 상태 모델을 참고한다."
---
# Batch 실패 후 재시작과 복구

긴 batch가 90% 진행된 뒤 실패했을 때 처음부터 다시 실행해도 되는지는 처리한 작업의 성격에 따라 달라집니다. 단순 계산이라면 다시 해도 괜찮을 수 있지만, 이미 row를 저장하거나 메일·외부 API 같은 side effect를 실행했다면 재실행이 중복 효과를 만들 수 있습니다.

그래서 batch는 정상 처리량뿐 아니라 **어디까지 완료됐고, 실패 뒤 어느 지점부터 어떤 근거로 다시 시작할지**를 설계해야 합니다.

```text
Step A ─ completed
Step B ─ completed
Step C ─ item 42,001에서 failed
Step D ─ not started
```

### 재시작하려면 진행 상태가 process 밖에 남아 있어야 한다

현재 index나 완료 Step을 메모리에만 들고 있다면 process가 죽는 순간 함께 사라집니다. 재시작 가능한 batch는 Job/Step execution metadata나 checkpoint를 durable storage에 기록해 다음 실행이 이전 상태를 읽을 수 있게 합니다.

```text
process crash
   │
   ▼
새 process 시작
   │
   └─ durable checkpoint 조회
          │
          ▼
      안전한 위치부터 재개
```

Spring Batch의 Job/Step/ExecutionContext 모델도 이런 재시작 정보를 저장하는 방향으로 설계되어 있습니다.

### Checkpoint와 idempotency는 다른 문제다

Checkpoint는 **어디에서 다시 시작할지**를 알려 줍니다. Idempotency는 같은 논리 작업이 다시 실행되어도 중복 효과가 생기지 않게 합니다.

```text
checkpoint 없음 + idempotent
→ 처음부터 다시 해도 결과는 안전하지만 비효율적일 수 있음

checkpoint 있음 + non-idempotent side effect
→ checkpoint 경계와 실제 효과 시점이 어긋나면 중복 가능
```

예를 들어 메일을 보낸 직후 checkpoint 저장 전에 process가 죽으면 다음 실행은 그 메일을 다시 보낼 수 있습니다. 따라서 side effect가 있는 작업은 business key, 처리 기록, provider idempotency 같은 근거로 이미 완료된 작업인지 확인할 필요가 있습니다.

### 실패 종류에 따라 같은 재시작 정책을 쓰지 않는다

일시적인 network 오류는 제한적으로 retry할 수 있지만 잘못된 입력 한 건을 영원히 재시도해 전체 batch를 막는 것은 복구가 아닙니다.

| 실패 | 검토할 대응 |
| --- | --- |
| 일시적 network 오류 | bounded retry + backoff |
| 유효하지 않은 item | 실패 기록 후 skip 또는 job 중단 정책 |
| DB serialization/deadlock victim | transaction 단위 재실행 가능성 검토 |
| 코드 결함 | job 중단, 수정·배포 후 명시적 재시작 |

Skip을 허용한다면 "성공 99%, 실패 1%"가 제품적으로 완료 상태인지, 실패 item을 어디에서 다시 처리할지도 정의해야 합니다.

### 재시작 단위는 transaction 경계와 맞물린다

Chunk 1,000개를 한 transaction으로 commit했다면 commit된 chunk는 완료 상태로 보고 다음 chunk부터 시작할 수 있습니다. 반면 checkpoint는 저장됐는데 실제 business transaction이 rollback됐다면 진행 상태와 DB 상태가 어긋납니다.

Framework를 사용할 때도 metadata transaction과 business transaction이 어떤 순서로 commit되는지 이해해야 하는 이유입니다.

좋은 batch는 "몇 건/초를 처리한다"뿐 아니라 **중간 실패 시 완료된 범위를 어떻게 증명하고, 어떤 작업은 다시 실행해도 안전하며, 어떤 오류는 사람의 개입이 필요한지**까지 설명할 수 있어야 합니다.
