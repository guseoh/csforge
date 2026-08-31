---
kind: concept
contentKey: database.core.locking.deadlock
topicContentKey: database.core.locking
slug: deadlock
title: "Deadlock과 lock 순서"
summary: "두 transaction이 서로 상대가 가진 lock을 기다리는 cycle을 timeline으로 이해하고 PostgreSQL이 deadlock을 감지해 하나를 abort하는 이유와 일관된 lock 순서의 예방 효과를 판단한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS"
    title: "PostgreSQL Documentation: Deadlocks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: deadlock cycle, detection과 transaction abort 확인
---
# Deadlock과 lock 순서

두 transaction이 각각 다른 row를 먼저 잠근 뒤 상대 row를 기다리면 둘 다 스스로는 진행할 수 없는 cycle이 만들어집니다.

```text
T1                                  T2
────────────────────────────────    ────────────────────────────────
UPDATE account 1  → lock A
                                    UPDATE account 2 → lock B
UPDATE account 2
→ B 기다림                         UPDATE account 1
                                    → A 기다림

T1 waits for T2 ─────┐
                     └──── T2 waits for T1
```

누군가 양보하지 않으면 무한 대기입니다. PostgreSQL은 deadlock을 감지하면 transaction 하나를 abort해 cycle을 끊습니다.

### deadlock은 단순 lock timeout과 다르다

일반 lock wait은 상대 transaction이 곧 commit하면 정상적으로 풀릴 수 있습니다. deadlock은 기다림 관계가 cycle이라 **아무도 스스로 진행해 lock을 놓을 수 없습니다.**

### 동일한 자원 순서가 강력한 예방책이다

송금에서 항상 작은 account ID부터 lock한다고 정하면 두 transaction이 반대 순서로 lock을 잡는 상황을 줄일 수 있습니다.

```text
Rule: account id 오름차순으로 lock

Transfer 1→2 : lock 1 → lock 2
Transfer 2→1 : lock 1 → lock 2
```

두 번째 transaction은 처음부터 account 1에서 기다리므로 cycle이 생기지 않습니다.

### application은 abort 가능성을 처리해야 한다

deadlock victim transaction은 rollback됩니다. 사용자는 일부만 성공한 상태를 봐서는 안 되고, retry 가능한 operation이라면 전체 transaction 재시도를 검토할 수 있습니다. 다만 외부 side effect가 transaction 중간에 있었다면 단순 재시도는 중복 문제를 만들 수 있습니다.

### 모든 deadlock을 제거하려고 거대한 lock 하나를 잡는 것도 문제다

전역적으로 모든 작업을 한 순서로 직렬화하면 deadlock은 줄지만 concurrency도 사라집니다. lock granularity와 순서를 실제 contention 패턴에 맞추는 것이 중요합니다.

Deadlock 분석에서는 stack trace 한 줄보다 **누가 어떤 lock을 보유하고 무엇을 기다렸는지 wait-for graph를 복원하는 것**이 핵심입니다.
