---
kind: concept
contentKey: backend.core.testing-recovery.failure-recovery
topicContentKey: backend.core.testing-recovery
slug: failure-recovery
title: "실패 모델과 복구 경로"
summary: "정상 경로만 설계하지 않고 부분 실패 후 남는 상태를 정의하고 retry, compensation, manual recovery 중 적절한 방법을 선택한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://sre.google/sre-book/handling-overload/"
    title: "Google SRE - Handling Overload"
    referenceType: BOOK
    language: en
    displayOrder: 1
    relationNote: "실패와 과부하를 정상적인 시스템 조건으로 다루는 관점을 참고한다."
---
# 실패 모델과 복구 경로

분산된 backend 작업은 "성공 또는 아무 일도 없음" 두 상태만 가지지 않는다. DB commit은 성공했지만 응답이 유실될 수 있고, 결제는 승인됐지만 주문 상태 저장이 실패할 수 있으며, 메시지는 처리됐지만 ack 전에 consumer가 죽을 수 있다.

### 먼저 실패 지점을 나열한다

```text
Request
  │
  ├─ validate
  ├─ DB commit            ✓
  ├─ external payment     ✓
  ├─ publish event        ✗
  └─ response             not reached
```

이때 재시도만 하면 결제를 다시 호출할 수 있다. 그래서 각 단계가 retry-safe한지, 이미 발생한 side effect를 조회할 수 있는지, compensation이 가능한지를 구분한다.

### 복구 방식은 실패 성질에 따라 다르다

| 방식              | 적합한 상황                                       |
| ----------------- | ------------------------------------------------- |
| retry             | 일시 실패이며 재실행이 안전함                     |
| idempotent replay | 중복 요청을 허용하면서 같은 결과를 재구성 가능    |
| compensation      | 이미 발생한 side effect를 반대 작업으로 상쇄 가능 |
| reconciliation    | 두 시스템 상태를 주기적으로 비교해 불일치 복구    |
| manual recovery   | 자동 판단이 위험하고 드문 예외                    |

### 복구 가능한 상태를 남긴다

실패를 catch해서 로그만 찍고 끝내면 운영자가 무엇을 다시 해야 하는지 알 수 없다. `PENDING`, `PROCESSING`, `FAILED`, `COMPLETED` 같은 상태와 실패 원인, 마지막 시도 시각을 durable하게 기록하면 재시도나 수동 복구의 근거가 생긴다.

좋은 장애 대응은 "예외를 안 나게 한다"가 아니라 **예외가 난 뒤 어떤 상태가 남고 누가 어떻게 정상 상태로 돌리는지**가 설계되어 있다.
