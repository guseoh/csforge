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

WAL 덕분에 dirty data page를 commit마다 즉시 storage에 쓸 필요는 없지만, 영원히 WAL만 쌓을 수는 없습니다. Checkpoint는 **그 checkpoint가 보장하는 redo point 이전 변경이 data files에 반영되도록 dirty page를 기록하고, crash recovery가 WAL을 다시 적용해야 하는 기준점을 앞으로 이동**시키는 과정입니다.

### crash recovery는 checkpoint가 가리키는 redo point부터 필요한 WAL을 다시 적용한다

```text
Checkpoint record
      │
      └─ redo point
            │
            ├──── WAL record A
            ├──── WAL record B
            ├──── WAL record C
            │
            X crash

restart
  └─ redo point부터 필요한 WAL을 재적용해 consistent state 복구
```

checkpoint가 너무 오래 전이면 crash 후 더 많은 WAL을 재처리해야 하고 recovery 시간이 길어질 수 있습니다.

### checkpoint를 자주 하면 항상 좋은 것도 아니다

checkpoint 때 dirty page write가 몰리면 storage I/O가 증가해 foreground query latency에 영향을 줄 수 있습니다. PostgreSQL은 checkpoint write를 시간에 걸쳐 분산하려고 하지만 설정과 workload에 따라 부담이 커질 수 있습니다.

| checkpoint 경향 | 장점 | 비용 |
| --- | --- | --- |
| 너무 잦음 | recovery에서 다시 처리할 WAL 범위를 줄일 수 있음 | dirty-page write 증가, `full_page_writes` 사용 시 full-page WAL 증가 가능 |
| 너무 드묾 | checkpoint write 빈도 감소 | WAL 증가와 crash recovery 작업량 증가 가능 |

### `max_wal_size`는 WAL 사용량의 절대 상한이 아니다

`max_wal_size`는 checkpoint scheduling에 영향을 주는 soft limit 성격의 설정입니다. replication slot, archive failure, 오래 걸리는 backup 같은 다른 보존 이유가 있으면 실제 `pg_wal` 사용량이 이를 넘을 수 있습니다. 따라서 “이 값만 설정하면 WAL disk usage가 반드시 그 아래로 제한된다”고 이해하면 안 됩니다.

### checkpoint 지표 이름은 PostgreSQL 버전을 확인한다

이 curriculum의 baseline은 PostgreSQL 16+이므로 특정 버전의 statistics column 이름을 영구적인 계약처럼 쓰지 않습니다. PostgreSQL 16에서는 `pg_stat_bgwriter.checkpoints_timed`, `checkpoints_req`, `checkpoint_write_time` 같은 checkpoint 통계를 제공하지만, 최신 PostgreSQL에서는 checkpointer 통계가 별도 `pg_stat_checkpointer`로 분리되고 `num_timed`, `num_requested` 같은 이름을 사용합니다. 운영에서는 **현재 서버 버전의 monitoring view와 column을 확인한 뒤** checkpoint 횟수·write/sync time·WAL volume을 함께 봅니다.

### checkpoint가 backup과 같은 것은 아니다

checkpoint가 성공했다고 media failure에서 데이터를 복구할 별도 backup이 생긴 것은 아닙니다. WAL/crash recovery는 **database process나 host crash 뒤 기존 storage의 일관된 상태를 복구하는 메커니즘**이고, storage 자체 유실·사용자 실수·원하는 시점 복구에는 backup과 WAL archive/PITR 같은 별도 복구 설계가 필요합니다.

Checkpoint는 단순 주기 작업이 아니라 **평상시 write I/O와 장애 후 recovery 작업량 사이의 비용을 조절하는 운영 메커니즘**입니다.
