---
kind: concept
contentKey: backend.core.bulk-batch.batch-recovery
topicContentKey: backend.core.bulk-batch
slug: batch-recovery
title: "Batch 실패와 재시작"
summary: "긴 작업에서 실패 지점을 기록하고 완료된 작업을 다시 수행하지 않도록 checkpoint와 idempotency를 설계한다."
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
# Batch 실패와 재시작

긴 batch가 90%까지 성공한 뒤 마지막 10%에서 실패했을 때 처음부터 다시 실행하는 것이 항상 안전한 것은 아니다. 이메일 발송, 외부 API 호출, 이미 저장된 row처럼 되돌리기 어려운 side effect가 있다면 재실행 자체가 중복 작업을 만든다.

### 재시작하려면 진행 상태를 알아야 한다

```text
Step A ── completed
Step B ── completed
Step C ── failed at item 42,001
Step D ── not started
```

프로세스 메모리만으로 이 상태를 들고 있으면 재시작 후 사라진다. 그래서 batch metadata나 checkpoint를 durable storage에 기록하고, 어떤 step/item까지 완료되었는지 다시 읽을 수 있어야 한다.

### checkpoint와 idempotency는 다른 문제다

checkpoint는 **어디서 다시 시작할지**를 알려 준다. idempotency는 같은 작업을 다시 수행하더라도 결과가 중복되지 않게 한다.

```text
checkpoint 없이 idempotent
→ 처음부터 다시 해도 중복은 없지만 느릴 수 있음

checkpoint 있으나 non-idempotent
→ 경계가 어긋나면 일부 작업이 두 번 실행될 수 있음
```

따라서 외부 메일/결제/파일 전송 같은 side effect가 있는 step은 단순히 offset만 저장해서는 부족하다. business key나 실행 기록을 이용해 이미 완료된 작업인지 판단할 필요가 있다.

### 실패를 숨기지 말고 분류한다

재시도 가능한 일시 오류와 데이터 자체가 잘못된 영구 오류를 구분해야 한다. 잘못된 한 행 때문에 전체 작업이 영원히 재시도되는 구조는 복구 설계가 아니다.

| 실패                 | 일반적인 대응                           |
| -------------------- | --------------------------------------- |
| 일시적 네트워크 오류 | 제한된 retry + backoff                  |
| 유효하지 않은 입력   | 실패 item 기록 후 정책에 따라 skip/중단 |
| DB deadlock          | transaction 단위 재시도 가능성 검토     |
| 코드 버그            | job 중단 후 수정·재배포                 |

좋은 batch는 정상 처리량보다 **중간 실패 후 어디서, 어떤 근거로, 어떤 작업을 다시 시작하는가**까지 설명할 수 있어야 한다.
