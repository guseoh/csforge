---
kind: concept
contentKey: database.core.storage.wal
topicContentKey: database.core.storage
slug: wal
title: "WAL과 write-ahead 원리"
summary: "변경된 data page를 먼저 영구 저장하는 대신 복구에 필요한 WAL record를 선행 기록해 crash 후 redo할 수 있게 하는 write-ahead logging과 commit durability의 관계를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/wal-intro.html"
    title: "PostgreSQL Documentation: WAL Introduction"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: WAL record 선행 기록과 crash recovery 원리 확인
---
# WAL과 write-ahead 원리

DB가 transaction commit 때마다 변경된 모든 table page를 storage에 즉시 기록해야 한다면 random I/O가 많아지고 commit latency가 커질 수 있습니다. PostgreSQL은 WAL(Write-Ahead Log)을 사용해 **data page보다 복구에 필요한 log record를 먼저 안전하게 기록**하는 방식을 사용합니다.

### write-ahead의 핵심 순서

```text
UPDATE row
   │
   ├─ memory page 변경 (dirty)
   │
   └─ WAL record 생성
          │
          ▼
      WAL을 먼저 durable하게 기록
          │
          ▼
      COMMIT 성공 가능
          │
          └─ data page는 이후 checkpoint/background write에서 기록 가능
```

Crash가 data page write 전에 발생해도 durable WAL record가 있다면 startup recovery에서 변경을 redo할 수 있습니다.

### WAL은 undo log와 같은 말이 아니다

PostgreSQL MVCC rollback은 단순히 WAL을 거꾸로 적용해 모든 변경을 undo하는 모델로 설명하면 부정확합니다. WAL의 핵심 목적은 crash recovery와 replication 등에 필요한 redo 정보이며, transaction abort visibility는 MVCC tuple 상태와 함께 동작합니다.

### commit 성공과 durability 설정의 관계

기본적인 synchronous commit 설정에서는 transaction의 commit record가 local WAL에 flush될 때까지 기다린 뒤 성공을 반환하는 것이 durability의 핵심입니다. 하지만 `synchronous_commit` 같은 설정으로 일부 durability/latency trade-off를 바꿀 수 있으므로 “PostgreSQL commit은 모든 환경에서 정확히 같은 storage flush semantics”라고 일반화하면 안 됩니다.

### WAL이 많아지는 workload도 비용이 있다

대량 UPDATE, index 변경, full-page image 등은 WAL volume을 늘릴 수 있습니다. replication은 WAL stream을 사용하므로 WAL 생성량 증가는 network/replica lag에도 연결될 수 있습니다.

WAL을 이해하는 핵심은 파일 이름이 아니라 **data page write와 commit durability를 분리해, 먼저 기록한 sequential log로 crash 후 상태를 재구성한다**는 순서입니다.
