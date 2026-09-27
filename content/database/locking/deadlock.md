---
kind: concept
contentKey: database.core.locking.deadlock
topicContentKey: database.core.locking
slug: deadlock
title: "교착 상태(Deadlock)와 잠금 순서"
summary: "두 트랜잭션이 서로 상대가 가진 잠금을 기다리는 순환을 시간 흐름으로 이해하고 PostgreSQL이 교착 상태를 감지해 하나를 중단하는 이유와 일관된 잠금 순서의 예방 효과를 판단한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS"
    title: "PostgreSQL Documentation: Deadlocks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 교착 상태의 대기 순환, 감지와 트랜잭션 중단 확인
---
# 교착 상태(Deadlock)와 잠금 순서

두 트랜잭션이 각각 다른 행을 먼저 잠근 뒤 상대 행을 기다리면 둘 다 스스로는 진행할 수 없는 순환이 만들어집니다.

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

누군가 양보하지 않으면 무한 대기입니다. PostgreSQL은 교착 상태를 감지하면 트랜잭션 하나를 중단해 순환을 끊습니다.

### 교착 상태는 단순 잠금 타임아웃과 다르다

일반 잠금 대기는 상대 트랜잭션이 곧 커밋하면 정상적으로 풀릴 수 있습니다. 교착 상태는 기다림 관계가 순환이므로 **아무도 스스로 진행해 잠금을 놓을 수 없습니다.**

### 동일한 자원 순서가 강력한 예방책이다

송금에서 항상 작은 계좌 ID부터 잠근다고 정하면 두 트랜잭션이 반대 순서로 잠금을 잡는 상황을 줄일 수 있습니다.

```text
Rule: account id 오름차순으로 lock

Transfer 1→2 : lock 1 → lock 2
Transfer 2→1 : lock 1 → lock 2
```

두 번째 트랜잭션은 처음부터 계좌 1에서 기다리므로 순환이 생기지 않습니다.

### 애플리케이션은 중단 가능성을 처리해야 한다

교착 상태의 희생 트랜잭션은 롤백됩니다. 사용자는 일부만 성공한 상태를 봐서는 안 되고, 재시도 가능한 작업이라면 전체 트랜잭션 재시도를 검토할 수 있습니다. 다만 외부 부수 효과가 트랜잭션 중간에 있었다면 단순 재시도는 중복 문제를 만들 수 있습니다.

### 모든 교착 상태를 제거하려고 거대한 잠금 하나를 잡는 것도 문제다

전역적으로 모든 작업을 한 순서로 직렬화하면 교착 상태는 줄지만 동시성도 사라집니다. 잠금 범위와 순서를 실제 경합 패턴에 맞추는 것이 중요합니다.

교착 상태 분석에서는 스택 트레이스 한 줄보다 **누가 어떤 잠금을 보유하고 무엇을 기다렸는지 대기 그래프(wait-for graph)를 복원하는 것**이 핵심입니다.
