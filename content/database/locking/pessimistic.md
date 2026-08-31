---
kind: concept
contentKey: database.core.locking.pessimistic
topicContentKey: database.core.locking
slug: pessimistic
title: "Pessimistic locking을 선택하는 기준"
summary: "충돌 가능성이 높거나 변경 전 다른 writer를 막아야 하는 경우 미리 lock을 획득하는 비관적 접근의 장점과 대기·deadlock·connection 점유 비용을 optimistic 방식과 비교한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE"
    title: "PostgreSQL Documentation: Locking Clause"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: SELECT FOR UPDATE/SHARE locking clause 확인
---
# Pessimistic locking을 선택하는 기준

비관적 잠금은 “동시에 바꿀 수 있으니 **먼저 lock을 잡고 작업하자**”는 전략입니다. 경쟁이 자주 일어나거나 읽은 상태를 기반으로 여러 결정을 수행하는 동안 다른 writer가 끼어들면 안 되는 경우에 고려할 수 있습니다.

```sql
BEGIN;

SELECT status, remaining
FROM coupon
WHERE id = 10
FOR UPDATE;

-- application rule 확인
UPDATE coupon
SET remaining = remaining - 1
WHERE id = 10;

COMMIT;
```

### correctness를 기다림으로 산다

```text
T1: lock 획득 ─ rule 계산 ─ UPDATE ─ COMMIT
          │
T2:       └──────────── wait ───────────► 이후 실행
```

T2는 stale 상태를 읽고 동시에 진행하는 대신 기다립니다. 충돌이 매우 빈번해서 optimistic retry가 계속 실패하는 workload에서는 이 방식이 단순할 수 있습니다.

### lock을 잡고 외부 I/O를 하면 비용이 급격히 커진다

```text
SELECT FOR UPDATE
   ↓ lock 보유
외부 결제 API 5초 대기
   ↓
UPDATE
COMMIT
```

5초 동안 같은 row를 원하는 transaction이 모두 기다리고, 현재 transaction은 DB connection도 오래 점유할 수 있습니다. 비관적 잠금을 선택했다면 **lock hold time을 가능한 짧게** 만드는 구조가 중요합니다.

### optimistic과의 선택 기준

| 상황                                      | 우선 검토                           |
| ----------------------------------------- | ----------------------------------- |
| 충돌이 드물고 재시도 비용이 낮음          | optimistic version                  |
| 충돌이 매우 잦고 실패 후 재작업 비용이 큼 | pessimistic lock 검토               |
| 단순 counter/재고 감소                    | atomic conditional UPDATE 먼저 검토 |
| 한 값의 uniqueness                        | UNIQUE constraint 먼저 검토         |

이 표는 절대 규칙이 아닙니다. 트래픽, lock wait, conflict rate를 측정해 판단합니다.

### `SKIP LOCKED`도 semantics를 바꾼다

worker queue처럼 다른 worker가 잡은 row를 기다리지 않고 다음 row를 처리하고 싶다면 `FOR UPDATE SKIP LOCKED`가 유용할 수 있습니다. 하지만 일반 사용자 조회에서 쓰면 잠긴 row가 결과에서 사라지는 **inconsistent view**를 만들 수 있으므로 workload 의미에 맞춰야 합니다.

Pessimistic locking은 강한 해결책이지만 비용도 명확합니다. “동시성이 걱정되니 일단 FOR UPDATE”가 아니라 **어떤 invariant를 보호하고 예상 lock wait가 얼마인지**를 설명할 수 있을 때 선택합니다.
