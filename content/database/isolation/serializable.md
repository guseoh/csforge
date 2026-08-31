---
kind: concept
contentKey: database.core.isolation.serializable
topicContentKey: database.core.isolation
slug: serializable
title: "SERIALIZABLE과 transaction 재시도"
summary: "동시 실행 결과가 어떤 직렬 실행과 동등하도록 보장하는 SERIALIZABLE의 목표와 PostgreSQL serialization failure가 정상적인 경쟁 결과일 수 있어 전체 transaction 재시도가 필요함을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/transaction-iso.html#XACT-SERIALIZABLE"
    title: "PostgreSQL Documentation: Serializable Isolation Level"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Serializable Snapshot Isolation과 serialization anomaly 방지 확인
  - url: "https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html"
    title: "PostgreSQL Documentation: Serialization Failure Handling"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: SQLSTATE 40001과 전체 transaction 재시도 지침 확인
---
# SERIALIZABLE과 transaction 재시도

SERIALIZABLE은 모든 transaction을 물리적으로 한 줄로 세워 실행한다는 뜻이 아닙니다. 여러 transaction을 동시에 실행하되 **최종 결과가 어떤 직렬 실행 순서와 동등하도록** 보장하려는 가장 강한 표준 isolation 수준입니다.

두 의사가 각각 “현재 당직 의사가 최소 2명인지” 확인하고 자기 당직을 해제하는 상황을 생각해 봅시다.

```text
T1                               T2
──────────────────────────────   ─────────────────────
현재 당직 2명 확인                현재 당직 2명 확인
내 당직 해제                     내 당직 해제
COMMIT?                          COMMIT?
```

각자 읽은 시점에는 규칙을 만족하지만 둘 다 commit하면 당직이 0명이 되어 invariant가 깨집니다. row 하나를 똑같이 덮어쓴 lost update와 다른 종류의 serialization anomaly입니다.

### PostgreSQL은 위험한 의존 관계를 감지해 한 transaction을 실패시킬 수 있다

SERIALIZABLE에서 PostgreSQL은 이런 실행이 안전한 직렬 순서로 설명될 수 없다고 판단하면 `serialization_failure`를 발생시킬 수 있습니다.

```text
T1 ──────┐
         ├─ dangerous dependency → T2 또는 T1 abort
T2 ──────┘

남은 transaction만 commit
```

이 실패는 “DB가 망가졌다”가 아니라 **강한 isolation을 지키기 위해 의도적으로 한 작업을 되돌린 결과**입니다.

### 재시도는 transaction 전체를 다시 실행한다

중간 SELECT 결과가 재시도 시 달라질 수 있으므로 마지막 UPDATE만 다시 보내는 것이 아니라 보통 transaction logic 전체를 처음부터 재실행해야 합니다.

```java
for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
        runWholeTransaction();
        return;
    } catch (SerializationFailure e) {
        backoff(attempt);
    }
}
```

실제 구현에서는 Spring exception translation, SQLSTATE, retry 범위, side effect 존재 여부를 확인해야 합니다. transaction 내부에서 외부 이메일이나 결제를 이미 전송했다면 단순 재시도가 중복 side effect를 만들 수 있습니다.

### 강한 isolation도 unique constraint를 대체하지는 않는다

“email은 유일해야 한다” 같은 직접적인 invariant는 UNIQUE constraint가 더 명확합니다. SERIALIZABLE을 사용하더라도 schema constraint, atomic update, explicit lock 중 가장 단순하고 직접적인 보호 수단을 먼저 검토합니다.

SERIALIZABLE은 편한 만능 버튼이 아니라 **복잡한 concurrent invariant를 DB가 직렬 실행과 같은 결과로 보호하는 대신 conflict abort와 retry 비용을 받아들이는 선택**입니다.
