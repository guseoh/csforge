---
kind: concept
contentKey: backend.core.testing-recovery.failure-recovery
topicContentKey: backend.core.testing-recovery
slug: failure-recovery
title: "실패 모델과 복구 경로"
summary: "정상 경로만 설계하지 않고 부분 실패 뒤 남는 상태를 탐지·기록한 다음 재시도, 재생, 보상, 상태 대조, 수동 복구 중 적절한 방법으로 불변식을 회복한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://learn.microsoft.com/ko-kr/azure/architecture/patterns/compensating-transaction"
    title: "Microsoft Learn: 보상 트랜잭션 패턴"
    referenceType: OFFICIAL
    language: ko
    displayOrder: 1
    relationNote: "여러 단계 중 일부가 이미 완료된 상태에서 단순 rollback이 아니라 의미 있는 보상 작업으로 일관성을 회복하는 원칙을 확인한다."
  - url: "https://sre.google/sre-book/handling-overload/"
    title: "Google SRE Book: Handling Overload"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "실패와 과부하를 정상적인 시스템 조건으로 다루는 관점을 참고한다."
---
# 실패 모델과 복구 경로

분산된 백엔드 작업은 "성공 또는 아무 일도 없음" 두 상태만 가지지 않습니다. DB commit은 성공했지만 응답이 유실될 수 있고, 결제는 승인됐지만 주문 상태 저장이 실패할 수 있으며, 메시지는 처리됐지만 ack 전에 consumer가 죽을 수 있습니다. 그래서 복구 설계는 예외를 잡는 코드보다 **실패 순간에 어떤 상태가 이미 남았는지 증명하는 것**에서 시작합니다.

### 먼저 실패 지점과 부분 완료 상태를 나열한다

```text
요청
  │
  ├─ 입력 검증             ✓
  ├─ DB commit             ✓
  ├─ 외부 결제             ✓
  ├─ 이벤트 발행           ✗
  └─ 응답 전송             실행되지 않음
```

이 상태에서 전체 요청을 처음부터 재시도하면 이미 성공한 결제를 다시 호출할 수 있습니다. 따라서 각 단계가 재실행 가능한지, 이미 발생한 부수 효과를 조회할 수 있는지, 반대 작업으로 상쇄할 수 있는지를 구분해야 합니다.

### 복구는 탐지 → 근거 확보 → 조치 → 정상 상태 확인으로 닫힌다

```text
부분 실패 탐지
   ↓
내부 상태·외부 처리 결과·멱등성 키 등 근거 확인
   ↓
재시도 / 재생 / 보상 / 상태 대조 / 수동 복구
   ↓
업무 불변식이 다시 만족되는지 확인
   ↓
COMPLETED 또는 사람의 판단이 필요한 FAILED 상태로 확정
```

예를 들어 주문은 `PAID_PENDING_EVENT`인데 이벤트가 없다는 사실을 탐지했다면, 결제를 다시 하는 것이 아니라 **현재 durable 상태에서 누락된 단계만 다시 수행할 수 있는가**를 먼저 봅니다. 복구 작업 자체도 중간에 실패할 수 있으므로 반복 실행해도 같은 결과로 수렴하도록 식별자와 상태 전이를 설계해야 합니다.

### 복구 방식은 실패 성질에 따라 다르다

| 방식 | 적합한 상황 |
| --- | --- |
| 재시도 | 일시적인 실패이며 같은 작업을 다시 실행해도 안전함 |
| 멱등 재생 | 동일 작업을 다시 실행해도 기존 결과를 재사용하거나 같은 상태로 수렴함 |
| 보상 | 이미 발생한 부수 효과를 업무적으로 반대되는 작업으로 상쇄할 수 있음 |
| 상태 대조(reconciliation) | 두 시스템의 현재 상태를 조회·비교해 어느 쪽이 실제 상태인지 판단 가능함 |
| 수동 복구 | 금전·권한·데이터 손상처럼 자동 판단이 더 위험한 드문 예외 |

보상은 DB rollback과 다릅니다. 외부 환불처럼 이미 확정된 작업을 되돌리는 새 업무 작업이며, 그 보상도 실패하거나 재시도될 수 있습니다. 따라서 보상 단계의 순서·멱등성·관측도 별도 계약이 필요합니다.

### 복구 가능한 상태와 근거를 durable하게 남긴다

실패를 `catch`해서 로그만 찍고 끝내면 다음 프로세스나 운영자가 무엇을 다시 해야 하는지 알 수 없습니다. `PENDING`, `PROCESSING`, `FAILED`, `COMPLETED` 같은 상태와 작업 식별자, 마지막 시도 시각, 외부 요청 ID, 안전한 실패 분류를 durable하게 기록하면 재시도나 수동 복구의 근거가 생깁니다.

다만 상태 이름만 추가한다고 복구가 되는 것은 아닙니다. `FAILED`에서 무엇을 다시 실행할 수 있는지, 외부 시스템의 결과를 어떻게 조회하는지, 정상 상태로 돌아왔다는 조건이 무엇인지까지 연결해야 합니다.

좋은 장애 대응은 "예외를 안 나게 한다"가 아니라 **예외가 난 뒤 남은 상태를 식별하고, 복구 작업을 수행한 다음 실제 불변식이 회복됐음을 확인할 수 있게 하는 것**입니다.
