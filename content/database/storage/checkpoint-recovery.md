---
kind: concept
contentKey: database.core.storage.checkpoint-recovery
topicContentKey: database.core.storage
slug: checkpoint-recovery
title: "Checkpoint와 crash recovery 범위"
summary: "checkpoint가 dirty buffer를 storage로 밀어 복구 시작점을 전진시키는 이유와 너무 잦은 checkpoint의 I/O spike, 너무 느린 checkpoint의 WAL·복구 시간 trade-off를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/wal-configuration.html"
    title: "PostgreSQL Documentation: WAL Configuration"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: checkpoint, checkpoint_timeout, max_wal_size와 recovery 관련 설정 확인
---
# Checkpoint와 crash recovery 범위

WAL 덕분에 dirty data page를 commit마다 즉시 storage에 쓸 필요는 없지만, 영원히 WAL만 쌓을 수는 없습니다. Checkpoint는 **그 시점 이전 변경을 반영한 dirty buffer를 storage에 충분히 기록하고 recovery 기준점을 앞으로 이동**시키는 과정입니다.

### crash recovery는 WAL을 다시 적용한다

```text
Checkpoint C
     │
     ├──── WAL record A
     ├──── WAL record B
     ├──── WAL record C
     │
     X crash

restart
  └─ 필요한 WAL을 redo해 consistent state 복구
```

checkpoint가 너무 오래 전이면 crash 후 더 많은 WAL을 재처리해야 하고 recovery 시간이 길어질 수 있습니다.

### checkpoint를 자주 하면 항상 좋은 것도 아니다

checkpoint 때 dirty page write가 몰리면 storage I/O가 크게 증가해 foreground query latency에 영향을 줄 수 있습니다. PostgreSQL은 checkpoint write를 시간에 걸쳐 분산하려고 하지만 설정과 workload에 따라 spike가 나타날 수 있습니다.

| checkpoint 경향 | 장점                            | 비용                                    |
| --------------- | ------------------------------- | --------------------------------------- |
| 너무 잦음       | recovery 범위가 짧아질 수 있음  | write I/O 증가, full-page WAL 증가 가능 |
| 너무 드묾       | foreground checkpoint 빈도 감소 | WAL 증가, crash recovery 범위 증가      |

### `max_wal_size`는 하드 디스크 사용 상한 하나로만 보면 안 된다

WAL 증가와 checkpoint scheduling에 영향을 주는 설정이며 replication slot, archive, long-running backup 같은 다른 요인도 WAL 보존량을 늘릴 수 있습니다. 운영에서는 `checkpoints_timed`, `checkpoints_req`, checkpoint write time, WAL volume 등을 함께 봅니다.

### checkpoint가 backup과 같은 것은 아니다

checkpoint가 성공했다고 media failure에서 데이터를 복구할 별도 backup이 생긴 것은 아닙니다. WAL/crash recovery는 **같은 database storage가 crash로 중간 상태가 된 상황**을 복구하는 메커니즘이고, backup/PITR는 다른 failure model까지 다룹니다.

Checkpoint는 단순 주기 작업이 아니라 **평상시 write I/O와 장애 후 recovery 시간 사이의 비용을 조절하는 운영 메커니즘**입니다.
